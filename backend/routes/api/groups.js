const router = require('express').Router();
const Sequelize = require('sequelize')
const { check } = require('express-validator')

const { handleValidationErrors } = require('../../utils/validation');
const { Group, Membership, GroupImage, User, Venue} = require('../../db/models');
const { requireAuth } = require('../../utils/auth')

const validateGroup = [
    check("name")
        .exists({checkFalsy: true})
        .isLength({max: 60})
        .withMessage("Name must be 60 characters or less"),
    check('about')
        .exists({checkFalsy: true})
        .isLength({min: 50})
        .withMessage("About must be 50 characters or more"),
    check('type')
        .exists({checkFalsy: true})
        .isIn(['Online', 'In person'])
        .withMessage("Type must be 'Online' or 'In person'"),
    check('private')
        .isIn([true, false])
        .withMessage("Private must be a boolean"),
    check('city')
        .exists({checkFalsy: true})
        .withMessage("City is required"),
    check('state')
        .exists({checkFalsy: true})
        .withMessage("State is required"),
    handleValidationErrors
]

isGroupOrganizer = async (req, res, next) => {
    const { groupId } = req.params;
    const currentUserId = req.user.id;

    const group = await Group.findByPk(groupId)

    if(!group) {
        const err = new Error("Couldn't find a Group with the specified Id");
        err.status = 404;
        err.errors = {message: "Group couldn't be found"};
        next(err);
    }

    if (group.organizerId !== parseInt(currentUserId)) {
        const err = new Error('Forbidden');
        err.status = 403;
        err.errors = {message: "Forbidden"};
        next(err);
    }

    next()
}

// Get all Groups
router.get('/', async (req, res, next) => {
    const allGroups = await Group.findAll();

    const allGroupsWith = await Promise.all(allGroups.map(async (group) => {

        const jsonGroup = group.toJSON();

        jsonGroup.numMembers = await Membership.count({where: {
            groupId: group.id
            }
        })

        const imageObj = await GroupImage.findOne({
            where: {
                groupId: group.id,
                preview: true
            }
        })

        if (!imageObj) {
            jsonGroup.previewImage = null
        } else {
            const {url} = imageObj;
            jsonGroup.previewImage = url;
        }

        return jsonGroup
    }))

    res.json({Groups: allGroupsWith});
})


// Get all Groups joined or organized by the Current User
router.get('/current', requireAuth, async (req, res, next) => {

    const currentUser = req.user.id

    const allGroupsCurrentUser = await Group.findAll({
       include: {
        model: Membership,
        attributes: [],
        where: {
            userId: currentUser
        }
       }
    })


    const allGroupsWith = await Promise.all(allGroupsCurrentUser.map(async (group) => {

        const jsonGroup = group.toJSON();

        jsonGroup.numMembers = await Membership.count({where: {
            groupId: group.id
            }
        })

        const imageObj = await GroupImage.findOne({
            where: {
                groupId: group.id,
                preview: true
            }
        })

        if (!imageObj) {
            jsonGroup.previewImage = null
        } else {
            const {url} = imageObj;
            jsonGroup.previewImage = url;
        }

        return jsonGroup
    }))


    res.json({Groups: allGroupsWith})
})


// Get details of a Group from an id
router.get('/:groupId', async (req, res, next) => {

    const {groupId} = req.params;


    const groupInfo = await Group.findByPk(groupId, {
        include: [
            {
                model: Membership,
                attributes: []

            },
            {
                model: GroupImage,
                attributes: ['id', 'url', 'preview']
            },
            {
                model: User,
                as: 'Organizer',
                attributes: ['id', 'firstName', 'lastName']
            },
            {
                model: Venue,
                attributes: {
                    exclude: ['createdAt', 'updatedAt']
                }
            }
        ]
    })

    const totalInfo = groupInfo.toJSON()
    totalInfo.numMembers = await Membership.count({where: {
        groupId: groupId
        }
    })


    if (groupInfo.id === null) {
        const err = new Error("Group couldn't be found");
        err.status = 404;
        err.title = "Couldn't find a Group with the specified id";
        err.errors = {message: "Group couldn't be found"}
        next(err)

    } else {

        res.json(totalInfo)
    }
})

// Create a Group
router.post('/', requireAuth, validateGroup, async (req, res, next) => {
    const {name, about, type, private, city, state} = req.body;

    const newGroup = await Group.create({
        organizerId: req.user.id,
        name,
        about,
        type,
        private,
        city,
        state
    })

    const firstMember = await Membership.create({
        userId: req.user.id,
        groupId: newGroup.id,
        status: "active"
    })

    res.json(newGroup)

})

// Add an image to a Group based on the Group's id
router.post('/:groupId/images', requireAuth, isGroupOrganizer, async (req, res, next) => {
    const { groupId } = req.params;
    const { url, preview } = req.body;

    const newImage = await GroupImage.create({
        groupId,
        url,
        preview,
    })

    const result = await GroupImage.findByPk(newImage.id, {
        attributes: {
            exclude: ['groupId', 'createdAt', 'updatedAt']
        }
    })


    res.json(result)

})

// Edit a Group
router.put('/:groupId', requireAuth, isGroupOrganizer, validateGroup, async (req, res, next) => {
    const { groupId } = req.params;
    const { name, about, type, private, city, state } = req.body;

    const currentGroup = await Group.findByPk(groupId)

   currentGroup.update({
        name,
        about,
        type,
        private,
        city,
        state
   })

   res.json(currentGroup);
})


// Delete a Group
router.delete('/:groupId', requireAuth, isGroupOrganizer, async (req, res, next) => {
    const { groupId } = req.params;

    const currentGroup = await Group.findByPk(groupId);

    currentGroup.destroy();

    res.json({message: "Successfully deleted"})
})



module.exports = router;
