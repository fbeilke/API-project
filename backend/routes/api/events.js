const router = require('express').Router();
const { check } = require('express-validator');

const { handleValidationErrors } = require('../../utils/validation');
const { Event, Group, Venue, Attendance, EventImage, Membership, User } = require('../../db/models');
const { requireAuth } = require('../../utils/auth');



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

const validateAttendanceStatus = [
    check('status')
        .isIn(['attending', 'waitlist'])
        .withMessage("Cannot change an attendance status to pending"),
    handleValidationErrors
]

const validateQueries = [
    check('page')
        .optional({nullable: true})
        .isInt({min: 1, max: 10})
        .withMessage("Page must be greater than or equal to 1"),
    check('size')
        .optional({nullable: true})
        .isInt({min: 1, max: 20})
        .withMessage("Size must be greater than or equal to 1"),
    check('name')
        .optional({nullable: true})
        .not()
        .isNumeric()
        .withMessage('Name must be a string'),
    check('name')
        .optional({nullable: true})
        .not()
        .isIn(['null', 'NaN', 'undefined', 'true', 'false'])
        .withMessage('Name must be a string'),
    check('type')
        .optional({nullable: true})
        .isIn(['Online', 'In person'])
        .withMessage("Type must be 'Online' or 'In person'"),
    check('startDate')
        .optional({nullable: true})
        .custom(value => {
            return Date.parse(value)
        })
        .withMessage("Start date must be a valid datetime"),
    handleValidationErrors
]


// Authorization
const isAttendee = async (req, res, next) => {
    const currentUserId = req.user.id;
    const { eventId } = req.params;

    const validEvent = await Event.findByPk(eventId)

    if (!validEvent) {
        const err = new Error("Event couldn't be found");
        err.title = "Couldn't find an Event with the specified id";
        err.status = 404;
        next(err);
    }

    const validAttendee = await Attendance.findOne({
        where: {
            userId: currentUserId,
            eventId,
            status: 'attending'
        }
    })

    if (!validAttendee) {
        const err = new Error("Forbidden");
        err.title = "Forbidden";
        err.status = 403;
        next(err);
    }

    next()
}

const isMember = async (req, res, next) => {
    const currentUserId = req.user.id;
    const { eventId } = req.params;

    const event = await Event.findByPk(eventId);

    if(!event) {
        const err = new Error("Event couldn't be found");
        err.title = "Couldn't find a Event with the specified id"
        err.status = 404;
        next(err);
    }

    const currentUserMembership = await Membership.findOne({
        where: {
            userId: currentUserId,
            groupId: event.groupId
        }
    })

    if (!currentUserMembership || currentUserMembership.status === 'Pending') {
        const err = new Error("Forbidden");
        err.title = "Forbidden";
        err.status = 403;
        next(err);
    }

    next();

}

const isOwnerOrCohostMember = async (req, res, next) => {
    const currentUserId = req.user.id;
    const { eventId } = req.params;

    const event = await Event.findByPk(eventId);

    if(!event) {
        const err = new Error("Event couldn't be found");
        err.title = "Couldn't find a Event with the specified id"
        err.status = 404;
        next(err);
    }

    const groupId = event.groupId;

    const membershipInfo = await Membership.findOne({
        where: {
            groupId: groupId,
            userId: currentUserId
        }
    })

    if (!membershipInfo || (membershipInfo.status !== 'Owner' && membershipInfo.status !== 'Co-host')) {
        const err = new Error('Forbidden');
        err.title = 'Forbidden';
        err.status = 403;
        next(err);
    }

    next()
  }


// Get all Attendees of an Event specified by its id
router.get('/:eventId/attendees', async (req, res, next) => {
    const { eventId } = req.params;

    // if owner or cohost
    if (req.user) {
        const currentUserId = req.user.id;
        const eventInfo = await Event.findByPk(eventId);

        if (!eventInfo) {
            const err = new Error("Event couldn't be found");
            err.title = "Couldn't find a Event with the specified id"
            err.status = 404;
            next(err);
        }

        const currentUserMembership = await Membership.findOne({
            where: {
                userId: currentUserId,
                groupId: eventInfo.groupId
            }
        })

        if (!currentUserMembership) {
            const attendanceInfoGeneral = await User.findAll({
                attributes: ['id', 'firstName', 'lastName'],
                include: {
                    model: Attendance,
                    as: 'Attendance',
                    where: {
                        eventId,
                        status: ['attending', 'waitlist']
                    },
                    attributes: ['status']
                }
            })

            res.json({Attendees: attendanceInfoGeneral})
            return;
        }

        if (currentUserMembership.status === 'Owner' || currentUserMembership.status === 'Co-host') {
            const attendanceInfoOwnerCohost = await User.findAll({
                attributes: ['id', 'firstName', 'lastName'],
                include: {
                    model: Attendance,
                    as: 'Attendance',
                    where: {
                        eventId
                    },
                    attributes: ['status']
                }
            })

            res.json({Attendees: attendanceInfoOwnerCohost})
            return;
        }
    }

    const eventInfo = await Event.findByPk(eventId);

    if (!eventInfo) {
        const err = new Error("Event couldn't be found");
        err.title = "Couldn't find a Event with the specified id"
        err.status = 404;
        next(err);
    }

    const attendanceInfoGeneral = await User.findAll({
        attributes: ['id', 'firstName', 'lastName'],
        include: {
            model: Attendance,
            as: 'Attendance',
            where: {
                eventId,
                status: ['attending', 'waitlist']
            },
            attributes: ['status']
        }
    })

    res.json({Attendees: attendanceInfoGeneral})

})


// Get all Events
router.get('/', validateQueries, async (req, res, next) => {
    let { page, size, name, type, startDate } = req.query;

    const where = {};

    if (name) where.name = name;
    if (type) where.type = type;
    if (startDate) where.startDate = startDate;

    if(!page) page = 1;
    if(!size) size = 20;

    const pagination = {
        limit: size,
        offset: (page - 1) * size
    }


    const allEvents = await Event.findAll({
        where,
        attributes: {
            exclude: ['description', 'capacity', 'price', 'createdAt', 'updatedAt']
        },
        include: [
            {
                model: Group,
                attributes: ['id', 'name', 'city', 'state']
            },
            {
                model: Venue,
                attributes: ['id', 'city', 'state']
            }
        ],
        ...pagination
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


    res.json({Events: allEventsWith, page: parseInt(page), size: parseInt(size)})

})


// Get details of an Event specified by its id
router.get('/:eventId', async (req, res, next) => {
    const { eventId } = req.params;

    const currentEvent = await Event.findByPk(eventId, {
        attributes: {
            exclude: ['createdAt', 'updatedAt']
        },
        include: [
            {
                model: Group,
                attributes: ['id', 'name', 'private', 'city', 'state']
            },
            {
                model: Venue,
                attributes: ['id', 'address', 'city', 'state', 'lat', 'lng']
            },
            {
                model: EventImage,
                attributes: ['id', 'url', 'preview']
            }
        ]
    })

    if (!currentEvent) {
        const err = new Error("Event couldn't be found");
        err.title = "Couldn't find an Event with the specified id";
        err.status = 404;
        next(err);
    }

    const result = currentEvent.toJSON();
    result.numAttending = await Attendance.count({
        where: {
            eventId,
        }
    })

    res.json(result);
})


// Request to Attend an Event based on the Event's id
router.post('/:eventId/attendance', requireAuth, isMember, async (req, res, next) => {
    const { eventId } = req.params;
    const currentUserId = req.user.id;

    const attendanceCheck = await Attendance.findOne({
        where: {
            eventId,
            userId: currentUserId
        }
    })

    if(!attendanceCheck) {
        const newAttendanceRequest = await Attendance.create({
            eventId,
            userId: currentUserId,
            status: 'pending'
        })

        const result = await Attendance.findByPk(newAttendanceRequest.id, {
            attributes: ['userId', 'status']
        })

        res.json(result);
    } else if (attendanceCheck.status === 'attending') {
        const err = new Error("User is already an attendee of the event");
        err.title = "Current User is already an accepted attendee of the event";
        err.status = 400;
        next(err);
    } else {
        const err = new Error("Attendance has already been requested");
        err.title = "Current User already has a pending attendance for the event";
        err.status = 400;
        next(err);
    }
})



// Add an Image to an Event based on the Event's id
router.post('/:eventId/images', requireAuth, isAttendee, async (req, res, next) => {
    const { eventId } = req.params;
    const { url, preview } = req.body;

    const newImage = await EventImage.create({
        eventId,
        url,
        preview
    })

    const result = await EventImage.findByPk(newImage.id, {
        attributes: ['id', 'url', 'preview']
    })

    res.json(result);

})


// Change the status of an attendance for an event specified by id
router.put('/:eventId/attendance', requireAuth, isOwnerOrCohostMember, validateAttendanceStatus, async (req, res, next) => {
    const { eventId } = req.params;
    const { userId, status } = req.body;

    const verifyUser = await User.findByPk(userId);

    if (!verifyUser) {
        const err = new Error("User couldn't be found");
        err.title = "Couldn't find a User with the specified userId";
        err.status = 404;
        next(err);
    }

    const attendanceToUpdate = await Attendance.findOne({
        where: {
            eventId,
            userId
        }
    })

    if (!attendanceToUpdate) {
        const err = new Error("Attendance between the user and the event does not exist");
        err.title = "If attendance does not exist";
        err.status = 404;
        next(err);
    }

    attendanceToUpdate.update({
        status
    })

    const result = await Attendance.findByPk(attendanceToUpdate.id, {
        attributes: {
            exclude: ['createdAt', 'updatedAt']
        }
    })

    res.json(result);

})



// Edit an Event specified by its id
router.put('/:eventId', requireAuth, isOwnerOrCohostMember, validateEvent, async (req, res, next) => {
    const { eventId } = req.params;
    const { venueId, name, type, capacity, price, description, startDate, endDate } = req.body;

    const validVenue = await Venue.findOne({
        where: {
            id: venueId
        }
    });

    if (!validVenue && venueId !== null) {
        const err = new Error("Venue couldn't be found");
        err.title = "Couldn't find a Venue with the specified id";
        err.status = 404;
        next(err);
    }

    const currentEvent = await Event.findByPk(eventId);

    await currentEvent.update({
        venueId,
        name,
        type,
        capacity,
        price,
        description,
        startDate,
        endDate
    })

    const result = await Event.findByPk(eventId, {
        attributes: {
            exclude: ['createdAt', 'updatedAt']
        }
    })

    res.json(result);

})


// Delete attendance to an event specified by id
router.delete('/:eventId/attendance/:userId', requireAuth, async (req, res, next) => {
        const { eventId, userId } = req.params;
        const currentUserId = req.user.id;

        const verifyUser = await User.findByPk(userId);

        if (!verifyUser) {
            const err = new Error("User couldn't be found");
            err.title = "Couldn't find a User with the specified userId";
            err.status = 404;
            next(err);
            return;
        }

        const event = await Event.findByPk(eventId);

        if (!event) {
            const err = new Error("Event couldn't be found");
            err.title = "Couldn't find an Event with the specified id";
            err.status = 404;
            next(err);
            return;
        }

        const attendanceToDelete = await Attendance.findOne({
            where: {
                eventId,
                userId
            }
        })

        if (!attendanceToDelete) {
            const err = new Error("Attendance does not exist for this User");
            err.title = "Attendance does not exist for this User";
            err.status = 404;
            next(err);
            return;
        }

        const currentUserMembership = await Membership.findOne({
            where: {
                groupId: event.groupId,
                userId: currentUserId
            }
        })

        if (!currentUserMembership) {
            const err = new Error("Forbidden");
            err.title = "Forbidden";
            err.status = 403;
            next(err);
            return;
        }


        if (parseInt(currentUserId) === parseInt(userId) || currentUserMembership.status === "Owner") {
            await attendanceToDelete.destroy();

            res.json({message: "Successfully deleted attendance from event"});
        } else {
            const err = new Error("Forbidden");
            err.title = "Forbidden";
            err.status = 403;
            next(err);
            return;
        }


})


// Delete an Event specified by its id
router.delete('/:eventId', requireAuth, isOwnerOrCohostMember, async (req, res, next) => {
    const { eventId } = req.params;

    const currentEvent = await Event.findByPk(eventId);

    currentEvent.destroy();

    res.json({message: "Successfully deleted"})
})




module.exports = router;
