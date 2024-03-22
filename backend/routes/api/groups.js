const router = require('express').Router();
const Sequelize = require('sequelize')
const { check } = require('express-validator')
const { Op } = require('sequelize');

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

const validateEvent = [
    check('name')
        .exists({checkFalsy: true})
        .isLength({min: 5})
        .withMessage("Name must be at least 5 characters"),
    check('type')
        .exists({checkFalsy: true})
        .isIn(['Online', 'In person'])
        .withMessage("Type must be Online or In person"),
    check('capacity')
        .isNumeric({min: 1})
        .withMessage("Capacity must be an integer"),
    check('price')
        .isFloat({min: 0})
        .withMessage("Price is invalid"),
    check('description')
        .exists({checkFalsy: true})
        .withMessage("Description is required"),
    check('startDate')
        .custom(value => {
           currentDate = new Date();
           valueFormatted = new Date(value);
           return currentDate < valueFormatted
        })
        .withMessage("Start date must be in the future"),
    check('endDate')
        .custom((value, {req}) => {
            endDateFormatted = Date.parse(value);
            startDateFormatted = Date.parse(req.body.startDate);
            return endDateFormatted > startDateFormatted;
        })
        .withMessage("End date is less than start date"),
    handleValidationErrors
]

const validateMembershipStatus = [
    check('status')
        .isIn(["Member", "Co-host", "member", "co-host"])
        .withMessage("Cannot change a membership status to pending"),
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
        next(err);
    }

    if (group.organizerId !== parseInt(currentUserId)) {
        const err = new Error('Forbidden');
        err.title = 'Forbidden'
        err.status = 403;
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
        next(err);
    }

    if (!membershipInfo || (membershipInfo.status !== 'Owner' && membershipInfo.status !== 'Co-host')) {
        const err = new Error('Forbidden');
        err.title = 'Forbidden';
        err.status = 403;
        next(err);
    }

    next()
  }

// Get all Members of a Group specified by its id
router.get('/:groupId/members', async (req, res, next) => {
    const { groupId } = req.params;

    const currentGroup = await Group.findByPk(groupId)

    if(!currentGroup) {
        const err = new Error("Group couldn't be found");
        err.title = "Couldn't find a Group with the specified id"
        err.status = 404;
        next(err);
    }


    if (req.user) {

        const currentUserMembership = await Membership.findOne({
            where: {
                userId: req.user.id,
                groupId
            }
        })

        if (!currentUserMembership) {
            const listOfMembers = await User.findAll({
                attributes: {
                    exclude:  ['username', 'hashedPassword', 'updatedAt', 'createdAt', 'email']
                },
                include: {
                    model: Membership,
                    as: 'Membership',
                    attributes: ['status'],
                    where: {
                        groupId,
                        status: {
                            [Op.in]: ['Member', 'Co-host', 'Owner']
                        }
                    }
                }
            })

            res.json({Members: listOfMembers})
            return;
        } else if (currentUserMembership.status === 'Owner' || currentUserMembership.status === 'Co-host') {
            const listOfMembers = await User.findAll({
                attributes: {
                    exclude: ['username', 'hashedPassword', 'updatedAt', 'createdAt', 'email']
                },
                include: {
                    model: Membership,
                    as: 'Membership',
                    attributes: ['status', 'userId'],
                    where: {
                        groupId
                    }
                }
            })

            res.json({Members: listOfMembers})
            return;
        }

    }

    const listOfMembers = await User.findAll({
        attributes: {
            exclude:  ['username', 'hashedPassword', 'updatedAt', 'createdAt', 'email']
        },
        include: {
            model: Membership,
            as: 'Membership',
            attributes: ['status'],
            where: {
                groupId,
                status: {
                    [Op.in]: ['Member', 'Co-host', 'Owner']
                }
            }
        }
    })

    res.json({Members: listOfMembers})


})


// Get all Events of a Group specified by its id
router.get('/:groupId/events', async (req, res, next) => {
    const { groupId } = req.params;

    const group = await Group.findByPk(groupId);

    if (!group) {
        const err = new Error("Group couldn't be found");
        err.title = "Couldn't find a Group with the specified id";
        err.status = 404;
        next(err)
    }


    const allEvents = await Event.findAll({
        attributes: {
            exclude: ['capacity', 'price', 'createdAt', 'updatedAt']
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

        jsonGroup.numEvents = await Event.count({where: {
            groupId: group.id
        }})

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
    if (!groupInfo || groupInfo.id === null) {
        const err = new Error("Group couldn't be found");
        err.status = 404;
        err.title = "Couldn't find a Group with the specified id";
        next(err)
    }

    const totalInfo = groupInfo.toJSON()
    totalInfo.numMembers = await Membership.count({where: {
        groupId: groupId
        }
    })



     res.json(totalInfo)

})


// Request a Membership for a Group based on the Group's id
router.post('/:groupId/membership', requireAuth, async (req, res, next) => {
    const { groupId } = req.params;
    const currentUserId = req.user.id;

    const group = await Group.findByPk(groupId);

    if (!group) {
        const err = new Error("Group couldn't be found");
        err.status = 404;
        err.title = "Couldn't find a Group with the specified id";
        next(err);
        return;
    }

    const currentMember = await Membership.findOne({
        where: {
            groupId,
            userId: currentUserId
        }
    })

    if (currentMember && currentMember.status === 'Pending') {
        const err = new Error("Membership has already been requested");
        err.title = "Current User already has a pending membership for the group";
        err.status = 400;
        next(err);
        return;

    } else if (currentMember && currentMember.status !== 'Pending') {
        const err = new Error("User is already a member of the group");
        err.title = "Current User is already an accepted member of the group";
        err.status = 400;
        next(err);
        return;
    }

    const newMembership = await Membership.create({
        groupId,
        userId: currentUserId,
        status: 'Pending'
    })

    const result = await Membership.findByPk(newMembership.id, {
        attributes: [['userId', 'memberId'], 'status']
    })

    res.json(result)
})


// Create an Event for a Group specified by its id
router.post('/:groupId/events', requireAuth, isOwnerOrCohostMember, validateEvent, async (req, res, next) => {
    const { groupId } = req.params;
    let { venueId, name, type, capacity, price, description, startDate, endDate } = req.body;
        console.log('-------------------------', groupId)

    // Current implementation doesn't make use of venue information;

    // const validVenue = await Venue.findOne({
    //     where: {
    //         id: venueId,
    //         groupId
    //     }
    // });

    // if (!validVenue && venueId !== null) {
    //     const err = new Error("Venue couldn't be found");
    //     err.title = "Couldn't find a Venue with the specified id";
    //     err.status = 404;
    //     next(err);
    //     return;
    // }

    const newEvent = await Event.create({
        groupId,
        venueId,
        name,
        type,
        capacity,
        price,
        description,
        startDate,
        endDate
    })
    console.log('BIG NEW EVENT =======', newEvent)
    const firstAttendee = await Attendance.create({
        eventId: newEvent.id,
        userId: req.user.id,
        status: 'attending'
    })

    const result = await Event.findByPk(newEvent.id, {
        attributes: {
            exclude: ['createdAt', 'updatedAt']
        }
    })

    res.json(result);


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


// Change the Status of a membership for a group specified by id
router.put('/:groupId/membership', requireAuth, isOwnerOrCohostMember, validateMembershipStatus, async (req, res, next) => {
    const { groupId } = req.params;
    const currentUserId = req.user.id;
    const { memberId, status } = req.body;

    const statusFixed = status[0].toUpperCase() + status.slice(1)


    const currentUserMembership = await Membership.findOne({
        where: {
            userId: currentUserId,
            groupId
        }
    })

    const userValidation = await User.findByPk(memberId)

    if (!userValidation) {
        const err = new Error("User couldn't be found");
        err.title = "Couldn't find a User with the specified memberId";
        err.status = 404;
        next(err);
    }

    const memberToEdit = await Membership.findOne({
        where: {
            userId: memberId,
            groupId
        }
    })

    if (!memberToEdit) {
        const err = new Error("Membership between the user and the group does not exist");
        err.title = "If membership does not exist";
        err.status = 404;
        next(err);
    }


    if (statusFixed === 'Member' && memberToEdit.status === 'Pending') {
       await memberToEdit.update({
            status: statusFixed
        })

        const result = await Membership.findOne({
            where: {
                userId: memberId,
                groupId
            },
            attributes: ['id', 'groupId', ['userId', 'memberId'], 'status']
        })

        res.json(result)
        return;


    } if (statusFixed === 'Co-host' && currentUserMembership.status === 'Owner') {
        await memberToEdit.update({
            status: statusFixed
        })

        const result = await Membership.findOne({
            where: {
                userId: memberId,
                groupId
            },
            attributes: ['id', 'groupId', ['userId', 'memberId'], 'status']
        })

        res.json(result)

    } else {
        const err = new Error("Forbidden");
        err.title = "Forbidden";
        err.status = 403;
        next(err);
    }


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


// Delete membership to a group specified by id
router.delete('/:groupId/membership/:memberId', requireAuth, async (req, res, next) => {
    const { groupId, memberId } = req.params;
    const currentUserId = req.user.id;

    const userToEdit = await User.findByPk(memberId);

    if (!userToEdit) {
        const err = new Error("User couldn't be found");
        err.title = "Couldn't find a User with the specified memberId";
        err.status = 404;
        next(err);
        return
    }

    const groupToEdit = await Group.findByPk(groupId);

    if (!groupToEdit) {
        const err = new Error("Group couldn't be found");
        err.title = "Couldn't find a Group with the specified id";
        err.status = 404;
        next(err);
        return
    }

    const membershipToDelete = await Membership.findOne({
        where: {
            userId: memberId,
            groupId
        }
    })


    if (!membershipToDelete) {
        const err = new Error("Membership does not exist for this User");
        err.title = "Membership does not exist for this User"
        err.status = 404;
        next(err);
        return
    }


    const currentUserMembership = await Membership.findOne({
        where: {
            userId: currentUserId,
            groupId
        }
    })

    if (!currentUserMembership) {
        const err = new Error("Forbidden");
        err.title = "Forbidden"
        err.status = 403;
        next(err);
        return
    }




    if (currentUserMembership.status === 'Owner' || currentUserId === +(memberId)) {
        membershipToDelete.destroy();

        res.json({message: "Successfully deleted membership from group"})
    } else {
        const err = new Error("Forbidden");
        err.title = "Forbidden"
        err.status = 403;
        next(err);
        return
    }


})


// Delete a Group
router.delete('/:groupId', requireAuth, isGroupOrganizer, async (req, res, next) => {
    const { groupId } = req.params;

    const currentGroup = await Group.findByPk(groupId);

    currentGroup.destroy();

    res.json({message: "Successfully deleted"})
})



module.exports = router;
