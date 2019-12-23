'use strict';

module.exports.register = (server, serviceLocator) => {

  server.post(
    {
      path: '/users/new',
      name: 'Create User',
      version: '1.0.0',
      validation: {
        body: require('../validations/create_user')
      }
    },
    (req, res, next) => {
      serviceLocator.get('userController').create(req, res, next)
    }
  );

  server.get(
    {
      path: '/users/:email',
      name: 'Get User',
      version: '1.0.0',
      validation: {
        params: require('../validations/get_user.js')
      }
    },
    (req, res, next) =>
      serviceLocator.get('userController').get(req, res, next)
  );
  
  server.post(
    {
      path: '/users/delete',
      name: 'Delete User',
      version: '1.0.0',
      validation: {
        body: require('../validations/create_user')
      }
    },
    (req, res, next) => {
      serviceLocator.get('userController').delete(req, res, next)
    }
  );
  
  server.post(
    {
      path: '/users/auth',
      name: 'Authenticate User',
      version: '1.0.0',
      validation: {
        body: require('../validations/create_user')
      }
    },
    (req, res, next) => {
      serviceLocator.get('userController').auth(req, res, next)
    }
  );
  
  server.post(
    {
      path: '/stories/new',
      name: 'Create Story',
      version: '1.0.0'
    },
    (req, res, next) => {
      serviceLocator.get('storyController').create(req, res, next)
    }
  );
  
  server.post(
    {
      path: '/stories/delete',
      name: 'Delete Story',
      version: '1.0.0'
    },
    (req, res, next) => {
      serviceLocator.get('storyController').remove(req, res, next)
    }
  );
  
  server.post(
    {
      path: '/stories/edit',
      name: 'Edit Story',
      version: '1.0.0',
      validation: {
        body: require('../validations/edit_story')
      }
    },
    (req, res, next) => {
      serviceLocator.get('storyController').edit(req, res, next)
    }
  );
  
  server.post(
    {
      path: '/pages/new',
      name: 'Create Page',
      version: '1.0.0'
    },
    (req, res, next) => {
      serviceLocator.get('pageController').create(req, res, next)
    }
  );
};