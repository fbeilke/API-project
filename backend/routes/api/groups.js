const router = require('express').Router();
const Sequelize = require('sequelize')
const { check } = require('express-validator')

const { handleValidationErrors } = require('../../utils/validation');
const { Group, Membership, GroupImage, User, Venue} = require('../../db/models');
const { requireAuth } = require('../../utils/auth')

const validateNewGroup = [
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
        .exists({checkFalsy: true})
        .isIn(['true', 'false'])
        .withMessage("Private must be a boolean"),
    check('city')
        .exists({checkFalsy: true})
        .withMessage("City is required"),
    check('state')
        .exists({checkFalsy: true})
        .withMessage("State is required"),
    handleValidationErrors
]

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

router.get('/:groupId', async (req, res, next) => {

    const {groupId} = req.params;


    const groupInfo = await Group.findByPk(groupId, {
        attributes: {
            include: [[Sequelize.fn("COUNT", Sequelize.col("Memberships.id")), "numMembers"]]
        },
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

    if (groupInfo.id === null) {
        const err = new Error("Group couldn't be found");
        err.status = 404;
        err.title = "Couldn't find a Group with the specified id";
        err.errors = {message: "Group couldn't be found"}
        next(err)

    } else {

        res.json(groupInfo)
    }
})

router.post('/', requireAuth, validateNewGroup, async (req, res, next) => {
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

    res.json(newGroup)

})



module.exports = router;
