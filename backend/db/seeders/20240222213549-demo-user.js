'use strict';

const { User } = require('../models');
const bcrypt = require('bcryptjs');

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
    await User.bulkCreate([
      {
        email: 'demo1@example.com',
        username: 'demo1',
        firstName: 'Jay',
        lastName: 'Doe',
        hashedPassword: bcrypt.hashSync('password1')
      },
      {
        email: 'demo2@example.com',
        username: 'demo2',
        firstName: 'Joe',
        lastName: 'Doe',
        hashedPassword: bcrypt.hashSync('password2')
      },
      {
        email: 'demo3@example.com',
        username: 'demo3',
        firstName: 'John',
        lastName: 'Doe',
        hashedPassword: bcrypt.hashSync('password3')
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

    options.tableName = 'Users'
    const Op = Sequelize.Op;
    await queryInterface.bulkDelete(options, {
      username: {
        [Op.in]: ['demo1', 'demo2', 'demo3']
      }
    })
  }
};
