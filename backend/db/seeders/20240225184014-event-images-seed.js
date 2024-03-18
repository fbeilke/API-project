'use strict';

const { EventImage } = require('../models');

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
   await EventImage.bulkCreate([
    {
      eventId: 1,
      url: "https://res.cloudinary.com/dezjslj5y/image/upload/c_pad,b_auto:predominant,fl_preserve_transparency/v1710779208/cd52pigrp73r9qo9qs4o.jpg?_s=public-apps",
      preview: true
    },
    {
      eventId: 2,
      url: "https://res.cloudinary.com/dezjslj5y/image/upload/c_pad,b_auto:predominant,fl_preserve_transparency/v1710779208/tnxtv4ewvlw2ezrmhqfz.jpg?_s=public-apps",
      preview: true
    },
    {
      eventId: 3,
      url: "https://res.cloudinary.com/dezjslj5y/image/upload/c_pad,b_auto:predominant,fl_preserve_transparency/v1710779208/ogmkd4ajtwo2o8qbegz5.jpg?_s=public-apps",
      preview: true
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
    options.tableName = 'EventImages'
    const Op = Sequelize.Op
    await queryInterface.bulkDelete(options, {
      eventId: {
        [Op.in]: [1, 2, 3]
      }
    })
  }
};
