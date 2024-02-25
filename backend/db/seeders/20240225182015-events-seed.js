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
        name: 'Event1',
        type: 'indoor',
        startDate: '2024-02-25 12:00:00',
        endDate: '2024-02-25  5:00:00'
      },
      {
        venueId: 2,
        groupId: 2,
        name: 'Event2',
        type: 'indoor',
        startDate: '2024-02-29 00:00:00',
        endDate: '2024-02-29 23:59:59'

      },
      {
        venueId: 3,
        groupId: 3,
        name: 'Event3',
        type: 'indoor',
        startDate: '2024-12-25 00:00:00',
        endDate: '2024-12-25 23:59:59'
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
