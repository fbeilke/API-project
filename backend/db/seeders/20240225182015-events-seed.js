'use strict';

const { Event } = require('../models');

let options = {};
if (process.env.NODE_ENV === 'production') {
  options.schema = process.env.SCHEMA;
}

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    /**
     * Add seed commands here.
     *
     * Example:
     * await queryInterface.bulkInsert('People', [{
     *   name: 'John Doe',
     *   isBetaMember: false
     * }], {});
    */
    await Event.bulkCreate([
      {
        venueId: 1,
        groupId: 1,
        name: "First night at Freddy Fazbear's Pizza",
        type: 'In person',
        startDate: '2024-10-31 00:00:00',
        endDate: '2024-010-31  06:00:00',
        description: "Come spend a night with us original animatronics and friends at Freddy Fazbear's Pizza."
      },
      {
        venueId: 2,
        groupId: 2,
        name: "Night 2 at Freddy Fazbear's Pizza",
        type: 'In person',
        startDate: '2024-11-01 00:00:00',
        endDate: '2024-11-01 06:00:00',
        description: "Join us for another night at Freddy Fazbear's Pizza with a different cast of friends, new and old."

      },
      {
        venueId: 3,
        groupId: 3,
        name: "Lock-In at Freddy Fazbear's Mega Pizzaplex",
        type: 'In person',
        startDate: '2024-11-30 22:00:00',
        endDate: '2024-12-01 06:00:00',
        description: "We are having a lock-in event at the Mega Pizzaplex! Enjoy a night of pizza and games with the Glamrock crew and more!"
      }
    ], {validate: true})
  },

  async down (queryInterface, Sequelize) {
    /**
     * Add commands to revert seed here.
     *
     * Example:
     * await queryInterface.bulkDelete('People', null, {});
     */
    options.tableName = 'Events';
    const Op = Sequelize.Op;
    await queryInterface.bulkDelete(options, {
      name: {
        [Op.in]: ['Event1', 'Event2', 'Event3']
      }
    })
  }
};
