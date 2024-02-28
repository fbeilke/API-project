const router = require('express').Router();
const { check } = require('express-validator');

const { handleValidationErrors } = require('../../utils/validation');
const { Venue, Membership } = require('../../db/models');
const { requireAuth } = require('../../utils/auth');

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

// Authorization

const isOwnerOrCohostMember = async (req, res, next) => {
    const currentUserId = req.user.id;
    const { venueId } = req.params;

    const venue = await Venue.findByPk(venueId);

    if(!venue) {
        const err = new Error("Venue couldn't be found");
        err.title = "Couldn't find a Venue with the specified id"
        err.status = 404;
        next(err);
    }

    const groupId = venue.groupId;

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


// Edit a Venue specified by its id
router.put('/:venueId', requireAuth, isOwnerOrCohostMember, validateVenue, async (req, res, next) => {
    const { venueId } = req.params;
    const { address, city, state, lat, lng } = req.body;

    const currentVenue = await Venue.findByPk(venueId);

    await currentVenue.update({
        address,
        city,
        state,
        lat,
        lng
    })

    const result = await Venue.findByPk(venueId, {
        attributes: {
            exclude: ['createdAt', 'updatedAt']
        }
    });

    res.json(result)



})


module.exports = router;
