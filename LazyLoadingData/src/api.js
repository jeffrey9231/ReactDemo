import axios from "axios";

const getReposByPage = (currentPage) =>
  // get all google repos information from github
  axios.get(`https://api.github.com/orgs/google/repos?page=${currentPage}`);

export default getReposByPage;
