const router = require('express').Router();
const Sequelize = require('sequelize')
const { check } = require('express-validator')

const { handleValidationErrors } = require('../../utils/validation');
const { Group, Membership, GroupImage, User, Venue, Event, EventImage, Attendance} = require('../../db/models');
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

const validateVenue = [
    check('address')
        .exists({checkFalsy: true})
        .withMessage('Street address is required'),
    check('city')
        .exists({checkFalsy: true})
        .withMessage('City is required'),
    check('state')
        .exists({checkFalsy: true})
        .withMessage('State is required'),
    check('lat')
        .isFloat({min: -90, max: 90})
        .withMessage('Latitude must be within -90 and 90'),
    check('lng')
        .isFloat({min: -180, max: 180})
        .withMessage('Longitude must be within -180 and 180'),
    handleValidationErrors
]



// Authorization:

const isGroupOrganizer = async (req, res, next) => {
    const { groupId } = req.params;
    const currentUserId = req.user.id;

    const group = await Group.findByPk(groupId)

    if(!group) {
        const err = new Error("Group couldn't be found");
        err.title = "Couldn't find a Group with the specified id"
        err.status = 404;
        err.errors = {message: "Group couldn't be found"};
        next(err);
    }

    if (group.organizerId !== parseInt(currentUserId)) {
        const err = new Error('Forbidden');
        err.title = 'Forbidden'
        err.status = 403;
        err.errors = {message: "Forbidden"};
        next(err);
    }

    next()
  }

  const isOwnerOrCohostMember = async (req, res, next) => {
    const currentUserId = req.user.id;
    const { groupId } = req.params;

    const group = await Group.findByPk(groupId);

    const membershipInfo = await Membership.findOne({
        where: {
            groupId: groupId,
            userId: currentUserId
        }
    })

    if(!group) {
        const err = new Error("Group couldn't be found");
        err.title = "Couldn't find a Group with the specified id"
        err.status = 404;
        err.errors = {message: "Group couldn't be found"};
        next(err);
    }

    if (!membershipInfo || (membershipInfo.status !== 'Owner' && membershipInfo.status !== 'Co-host')) {
        const err = new Error('Forbidden');
        err.title = 'Forbidden';
        err.status = 403;
        err.errors = {message: 'Forbidden'};
        next(err);
    }

    next()
  }

// Get all Events of a Group specified by its id
router.get('/:groupId/events', async (req, res, next) => {
    const { groupId } = req.params;

    const group = await Group.findByPk(groupId);

    if (!group) {
        const err = new Error("Group couldn't be found");
        err.title = "Couldn't find a Group with the specified id";
        err.status = 404;
        err.errors = {message: "Group couldn't be found"};
        next(err)
    }


    const allEvents = await Event.findAll({
        attributes: {
            exclude: ['description', 'capacity', 'price', 'createdAt', 'updatedAt']
        },
        include: [
            {
                model: Group,
                attributes: ['id', 'name', 'city', 'state'],
                where: {
                    id: groupId
                }
            },
            {
                model: Venue,
                attributes: ['id', 'city', 'state']
            }
        ]
    })

    const allEventsWith = await Promise.all(allEvents.map(async (event) => {

        const jsonEvent = event.toJSON();

        jsonEvent.numAttending = await Attendance.count({
            where: {
                eventId: event.id
            }
        })

        const imageObj = await EventImage.findOne({
            where: {
                eventId: event.id,
                preview: true
            }
        })

        if (!imageObj) {
            jsonEvent.previewImage = null;
        } else {
            const { url } = imageObj;
            jsonEvent.previewImage = url;
        }


        return jsonEvent
    }))


    res.json({Events: allEventsWith})

})



// Get all Venues for a Group specified by its id
router.get('/:groupId/venues', requireAuth, isOwnerOrCohostMember, async (req, res, next) => {
    const { groupId } = req.params;

    const allVenues = await Venue.findAll({
        where: {
            groupId
        },
        attributes: {
            exclude: ['createdAt', 'updatedAt']
        }
    })

    res.json({Venues: allVenues});

})


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

// Create a new Venue for a Group specified by its id
router.post('/:groupId/venues', requireAuth, isOwnerOrCohostMember, validateVenue, async (req, res, next) => {
    const { groupId } = req.params;
    const { address, city, state, lat, lng } = req.body;

    const newVenue = await Venue.create({
        groupId,
        address,
        city,
        state,
        lat,
        lng
    })

    const result = await Venue.findByPk(newVenue.id, {
        attributes: {
            exclude: ['createdAt', 'updatedAt']
        }
    })

    res.json(result);


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
        status: "Owner"
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

   await currentGroup.update({
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
