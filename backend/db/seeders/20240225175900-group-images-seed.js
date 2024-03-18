'use strict';

const { GroupImage } = require('../models');

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
    await GroupImage.bulkCreate([
      {
        groupId: 1,
        url: "https://res.cloudinary.com/dezjslj5y/image/upload/c_pad,b_auto:predominant,fl_preserve_transparency/v1710778793/txmpeuqylcapkdomtpwt.jpg?_s=public-apps",
        preview: true
      },
      {
        groupId: 2,
        url: "https://res.cloudinary.com/dezjslj5y/image/upload/c_pad,b_auto:predominant,fl_preserve_transparency/v1710778808/qiwwqzvapmzxaaqoxk6w.jpg?_s=public-apps",
        preview: true
      },
      {
        groupId: 3,
        url: "https://res.cloudinary.com/dezjslj5y/image/upload/c_pad,b_auto:predominant,fl_preserve_transparency/v1710779208/uiknylhgxcyqtig2rk87.jpg?_s=public-apps",
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
    options.tableName = 'GroupImages';
    const Op = Sequelize.Op;
    await queryInterface.bulkDelete(options, {
      groupId: {
        [Op.in]: [1, 2, 3]
      }
    })
  }
};
