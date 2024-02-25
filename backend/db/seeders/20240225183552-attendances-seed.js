'use strict';

const { Attendance } = require('../models');

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
   await Attendance.bulkCreate([
    {
      eventId: 1,
      userId: 1,
      status: 'filler-status1'
    },
    {
      eventId: 2,
      userId: 2,
      status: 'filler-status2'
    },
    {
      eventId: 3,
      userId: 3,
      status: 'filler-status3'
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
    options.tableName = 'Attendances'
    const Op = Sequelize.Op;
    await queryInterface.bulkDelete(options, {
      eventId: {
        [Op.in]: [1, 2, 3]
      }
    })
  }
};
