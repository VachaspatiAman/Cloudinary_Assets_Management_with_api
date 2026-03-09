flow for Assets uploading on Cloudinary with API key using node.js and next.js

1. GET the api key form cloudinary dashboard
   1.1.Go to cloudinary dashboard
   1.2. Click on get started
   1.3. Click on view api keys
   1.4. Copy the api key, api secret and cloud name
   1.5. Store the api key, api secret and cloud name in a .env file

2. Create a Folder for server
   2.1. intall npm , express , multer , cloudinary, dotenv, cors, mongodb
   2.2. create a src folder in server folder
   2.3. create a folder for api inside src 
        2.3.1 route.js folder for route handling 
        2.3.2 multer help us to upload the files by creating a middleware and break the file into chunks for efficient upload the file to cloudinary then in the srever the chunks will be combined and uploaded to cloudinary by multer.  express will help us to create the server and handle the requests
        2.3.3 it should contain the logic for uploading the assets to cloudinary
        2.3.4 store the data in mongodb
        2.3.5 it should contain the logic for connecting to cloudinary
   2.4. create a server.js file in backend folder 
        2.4.1 it should contain the logic for starting the server
   2.5. create a db.js file in backend folder 
        2.5.1 it should contain the logic for connecting to mongodb
   2.6. create a .env file in backend folder 
        2.6.1 it should contain the api key, api secret and cloud name
   2.7. create a package.json file in backend folder 
        2.7.1 it should contain the dependencies and scripts
        2.7.2 it should contain the dev script for running the server

3. Create a Folder for frontend
   3.1. make a next.js app
   3.2. install tailwindcss, postcss, autoprefixer, axios
   3.3 inside the app folder create a components folder
   3.4 inside the components folder create a upload component
     3.4.1 inside this uploadfiles.tsx this help us to upload the files to the backend
   3.5 inside the app folder make a assets folder
     3.5.1 inside the page.tsx this alow us to see the assets uploaded to the backend in the frontend
   3.6 in page.tsx import the upload component and assets component this will help us to see the the frontend interface which will allow us to upload and see the assets



working of the app:

1. user will visit the ui of the app
  1.1. user will see the upload option for uploading the assets
  1.2 the file manger will show the file , select the file which you want to upload
  1.3 click on the upload button it will send the file to the server via api call
  1.4 the file will break into chunks and upload to cloudinary with the help of multer 
  1.5 the file will be stored in cloudinary and the metadata will be stored in mongodb
  1.6 the user will see the assets in the assets page
  1.7 the user can download the assets from the assets page

  but for downloading the pdf files we need to use a different approach
    -  In Cloudinary settings
               - security
                       - allowed the PDF and ZIP files delivery: true
                       after that we can download the pdf files
