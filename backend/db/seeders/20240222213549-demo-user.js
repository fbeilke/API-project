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
        email: 'freddy@fazbear.com',
        username: 'freddyfazbear',
        firstName: 'Freddy',
        lastName: 'Fazbear',
        hashedPassword: bcrypt.hashSync('freddypassword')
      },
      {
        email: 'chica@fazbear.com',
        username: 'chicafazbear',
        firstName: 'Chica',
        lastName: 'Fazbear',
        hashedPassword: bcrypt.hashSync('chicapassword')
      },
      {
        email: 'bonnie@fazbear.com',
        username: 'bonniefazbear',
        firstName: 'Bonnie',
        lastName: 'Fazbear',
        hashedPassword: bcrypt.hashSync('bonniepassword')
      },
      {
        email:'foxy@fazbear.com',
        username: 'foxyfazbear',
        firstName: 'Foxy',
        lastName: 'Fazbear',
        hashedPassword: bcrypt.hashSync('foxypassword')
      },
      {
        email: 'mikeschmidt@fazbear.com',
        username: 'mikeschmidt87',
        firstName: 'Mike',
        lastName: 'Schmidt',
        hashedPassword: bcrypt.hashSync('mikepassword')
      },
      {
        email: 'toyfreddy@fazbear.com',
        username: 'toyfreddy',
        firstName: 'Toy',
        lastName: 'Freddy',
        hashedPassword: bcrypt.hashSync('toyfreddypassword')
      },
      {
        email: 'glamrockfreddy@fazbear.com',
        username: 'glamrockfreddy',
        firstName: 'Glamrock',
        lastName: 'Freddy',
        hashedPassword: bcrypt.hashSync('glamrockfreddypassword')
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
