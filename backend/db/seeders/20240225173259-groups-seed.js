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
      name: 'Original Fazbear Animatronics',
      about: "We are the first thought of set of Fazbear animatronics in Five Nights at Freddy's 1. ",
      type: 'In person',
      private: false,
      city: 'New York',
      state: 'NY'
    },
    {
      organizerId: 6,
      name: 'FNAF 2',
      about: "We are the animatronics from Five Nights at Freddy's 2. We welcome a wider range of members, whether Withered or Toy set, or you want to come visit us for a night.",
      type: 'In person',
      private: false,
      city: 'New York',
      state: 'NY'
    },
    {
      organizerId: 7,
      name: 'Glamrocks',
      about: "We are the Glamrock animatronics from Five Nights at Freddy's: Security Breach. We are futuristic in design but 80s in aesthetic. We work with all staff bots and Vanessa as head of security.",
      type: 'In person',
      private: true,
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
    options.tableName = 'Groups'
    const Op = Sequelize.Op;
    await queryInterface.bulkDelete(options, {
      name: {
        [Op.in]: ['Group1', 'Group2', 'PrivateGroup']
      }
    })
  }
};
