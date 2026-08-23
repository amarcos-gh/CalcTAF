import axios from "axios";

const api = axios.create({

  baseURL: "http://localhost:3001"

});

api.interceptors.request.use(

  (config) => {

    const token =

      localStorage.getItem("token");

    if (token) {

      config.headers.Authorization =

        `Bearer ${token}`;

    }

    return config;

  },

  (error) => {

    return Promise.reject(error);

  }

);

api.interceptors.response.use(

  (response) => response,

  (error) => {

    if (error.response?.status === 401) {

      console.log("401 recebido");

      console.log(error.response);

      // localStorage.clear();

      // window.location.href = "/";

    }

    return Promise.reject(error);

  }

);

export default api;