'use strict';

const { Venue } = require('../models');

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
   await Venue.bulkCreate([
    {
      groupId: 1,
      address: '123 Address St',
      city: 'New York',
      state: 'NY'
    },
    {
      groupId: 2,
      address: '456 Address Ln',
      city: 'New York',
      state: 'NY'
    },
    {
      groupId: 3,
      address: '789 Address Dr',
      city: 'New York',
      state: 'NY'
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
    options.tableName = 'Venues'
    const Op = Sequelize.Op;
    await queryInterface.bulkDelete(options, {
      groupId: {
        [Op.in]: [1, 2, 3]
      }
    })
  }
};
