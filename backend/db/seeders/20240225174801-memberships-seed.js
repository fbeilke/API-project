'use strict';

const {Membership} = require('../models');

let options = {};
if (process.env.NODE_ENV === 'production') {
  options.schema = process.env.SCHEMA;
};

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
   await Membership.bulkCreate([
    {
      userId: 1,
      groupId: 1,
      status: 'Owner'
    },
    {
      userId: 2,
      groupId: 1,
      status: 'Member'
    },
    {
      userId: 3,
      groupId: 1,
      status: 'Member'
    },
    {
      userId: 4,
      groupId: 1,
      status: 'Member'
    },
    {
      userId: 6,
      groupId: 2,
      status: 'Owner'
    },
    {
      userId: 7,
      groupId: 3,
      status: 'Owner'
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
    options.tableName = 'Memberships'
    const Op = Sequelize.Op;
    await queryInterface.bulkDelete(options, {
      userId: {
        [Op.in]: [1, 2, 3]
      }
    })
  }
};
