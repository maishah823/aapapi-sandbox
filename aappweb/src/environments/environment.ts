// The file contents for the current environment will overwrite these during build.
// The build system defaults to the dev environment which uses `environment.ts`, but if you do
// `ng build --env=prod` then `environment.prod.ts` will be used instead.
// The list of which env maps to which file can be found in `angular.json`.

export const environment = {
  production: false,
  API_URI: 'http://localhost:3000',
  SOCKET_URI: 'ws://localhost:3000',
  // API_URI: 'https://aappapi.herokuapp.com',
  // SOCKET_URI: 'wss://aappapi.herokuapp.com',
  INSTRUCTOR_IMAGES: 'https://s3.us-east-2.amazonaws.com/aapp-instructors-dev',
  MEMBER_GALLERY: 'https://s3.us-east-2.amazonaws.com/aapp-member-gallery-dev',
  BLOG_IMAGES: 'https://s3.us-east-2.amazonaws.com/aapp-blogs-dev',
  FILES: 'https://s3.us-east-2.amazonaws.com/aapp-class-materials-local'
};
