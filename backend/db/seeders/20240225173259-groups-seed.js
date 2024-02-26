'use strict';

const { Group } = require('../models');

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
   await Group.bulkCreate([
    {
      organizerId: 1,
      name: 'Group1',
      about: 'We are group 1',
      type: 'filler-category1',
      private: false
    },
    {
      organizerId: 2,
      name: 'Group2',
      about: 'We are group 2',
      type: 'filler-category2',
      private: false
    },
    {
      organizerId: 3,
      name: 'PrivateGroup',
      about: 'We are group 3 and private',
      type: 'filler-category3',
      private: true
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
    options.tableName = 'Groups'
    const Op = Sequelize.Op;
    await queryInterface.bulkDelete(options, {
      name: {
        [Op.in]: ['Group1', 'Group2', 'PrivateGroup']
      }
    })
  }
};