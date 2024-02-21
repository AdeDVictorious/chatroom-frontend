let axios = require('axios');
const cloudinary = require('../middleware/cloudImage');

class Service {
  // create a new user
  async new_user(data) {
    console.log(data);
  }

  // Users login
  async user_login(data) {
    try {
      let response = await axios.post(
        'http://localhost:5000/api/v1/user/login_user',
        data,
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      let status = response.data.status;

      if (status === 200) {
        return { status: 200, message: response.data };
      }
    } catch (err) {
      console.log(err);
      return { status: 404, message: err.response.data };
    }
  }

  // save a chat message
  async chat_msg(req_data) {
    try {
      let data = {
        sender_id: req_data.sender_id,
        receiver_id: req_data.receiver_id,
        message: req_data.message,
      };

      let response = await axios.post(
        'http://localhost:5000/api/v1/chat/add_new_chat',
        data,
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      let status = response.data.status;

      if (status === 201) {
        return { status: 200, message: 'chat inserted', data: response.data };
      }
    } catch (err) {
      console.log(err.response);
      return { status: 404, message: 'error inserting chat message' };
    }
  }

  // create a group chat
  async group_chat(req_data) {
    try {
      let token = req_data.token;

      // ---- Save image to cloud ---- //
      let options = {
        use_filename: true,
        unique_filename: false,
        overwrite: true,
      };

      let result = await cloudinary.uploader.upload(req_data.path, options);

      let image = result.url;

      let data = {
        creator_id: req_data.user_id,
        name: req_data.name,
        image: image,
        limit: req_data.limit,
      };

      let response = await axios.post(
        'http://localhost:5000/api/v1/group_chat/new_group',
        data,
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        }
      );

      let status = response.data.status;

      if (status === 201) {
        return {
          status: 201,
          message: 'Group created successfully',
          data: response.data,
        };
      }
    } catch (err) {
      console.log(err.response);
      return { status: 404, message: err.response.data };
    }
  }

  // get the users
  async get_members(payload) {
    try {
      let token = payload.token;

      // format the payload
      let data = {
        group_id: payload.group_id,
        user_id: payload.user_id,
      };

      let response = await axios.post(
        'http://localhost:5000/api/v1/members/get_members',
        data,
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        }
      );

      let status = response.data.status;

      console.log(status);

      if (status === 200) {
        return {
          status: 200,
          message: 'Users found successfully',
          data: response.data,
        };
      }
    } catch (err) {
      console.log(err.response);
      return { status: 404, message: 'Error getting Users' };
    }
  }

  // add the users
  async add_members(payload, req_data) {
    try {
      // format the payload
      let group_id = payload.group_id;
      let limit = payload.limit;
      let token = req_data.token;
      let member = payload.members;

      let data = {
        group_id: group_id,
        limit: limit,
        members: member,
      };

      // Send to the server
      let response = await axios.post(
        'http://localhost:5000/api/v1/members/add_members',
        data,
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        }
      );

      let status = response.data.status;

      if (status === 201) {
        return {
          status: 201,
          message: 'Members added successfully',
          data: response.data,
        };
      }
    } catch (err) {
      console.log(err);
      return { status: 404, message: 'Error adding selected members' };
    }
  }

  // update group
  async updateGroup_ById(payload) {
    try {
      //  format the payload
      let token = payload.token;

      // delete the Old image uploaded to cloudinary
      let imageUrl = payload.last_image;

      let publicId = cloudinary
        .url(imageUrl, { type: 'fetch' })
        .split('/')
        .pop()
        .replace(/\..*/, '');

      // Delete the image using the public ID
      let last_image = await cloudinary.uploader.destroy(publicId);

      // ---- Save new image to cloud ---- //
      let options = {
        use_filename: true,
        unique_filename: false,
        overwrite: true,
      };

      let result = await cloudinary.uploader.upload(payload.path, options);

      let image = result.url;

      let data = {
        id: payload.group_id,
        group_name: payload.group_name,
        image: image,
        group_limit: payload.group_limit,
        last_limit: payload.last_limit,
      };

      let response = await axios.put(
        'http://localhost:5000/api/v1/group_chat/update_groupById',
        data,
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        }
      );

      let status = response.data.status;

      if (status === 200) {
        return {
          status: 200,
          message: 'Group update was successfully',
          data: response.data,
        };
      }
    } catch (err) {
      console.log(err.response);
      return { status: 404, message: 'Error updating the group' };
    }
  }

  // delete group
  async deleteGroup_ById(payload) {
    try {
      //  format the payload
      let token = payload.token;

      let id = payload.id;

      let response = await axios.delete(
        `http://localhost:5000/api/v1/group_chat/delete_group/${id}`,
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        }
      );

      let status = response.status;

      if (status === 204) {
        return {
          status: 204,
          message: 'Group deletion was successfully',
        };
      }
    } catch (err) {
      console.log(err.response);
      return { status: 404, message: 'Error updating the group' };
    }
  }

  // delete group image
  async deleteGroup_Image(payload) {
    try {
      // delete the Old image uploaded to cloudinary
      let imageUrl = payload.last_Image;

      let publicId = cloudinary
        .url(imageUrl, { type: 'fetch' })
        .split('/')
        .pop()
        .replace(/\..*/, '');

      // Delete the image using the public ID
      let last_image = await cloudinary.uploader.destroy(publicId);

      return {
        status: 200,
        message: 'Group image was deleted successfully',
      };
    } catch (err) {
      console.log(err);
      return { status: 404, message: 'Error deleting group image' };
    }
  }

  // // keep this here for later use case
  // // Extract public ID from the URL (assuming the URL is in the format: https://res.cloudinary.com/cloud_name/image/upload/public_id.jpg)
  // const imageUrl = 'https://res.cloudinary.com/your_cloud_name/image/upload/public_id.jpg';
  // const publicId = cloudinary.url(imageUrl, { type: 'fetch' }).split('/').pop().replace(/\..*/, '');

  // // Delete the image using the public ID
  // cloudinary.uploader.destroy(publicId, (error, result) => {
  //   if (error) {
  //     console.error('Error deleting image:', error.message);
  //   } else {
  //     console.log('Image deleted successfully:', result);
  //     // Update your database to remove the reference to the deleted image
  //     // TODO: Implement the database update logic here
  //   }
}

module.exports = Service;