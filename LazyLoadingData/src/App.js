// keep external package on the top
import React, { useEffect, useRef } from "react";
import { Row, Col, Spin, Radio, Input } from "antd";
import { orderBy, cloneDeep } from "lodash";

import "./styles.css";
import "antd/dist/antd.css";
import getReposByPage from "./api.js";

const { Search } = Input;

const SortContainer = (props) => {
  const { handleOrderByChange } = props;
  return (
    <Radio.Group onChange={handleOrderByChange}>
      <Radio.Button value="name">Name</Radio.Button>
      <Radio.Button value="watchers_count">Watchers</Radio.Button>
      <Radio.Button value="stargazers_count">Stars</Radio.Button>
    </Radio.Group>
  );
};

const DataContainer = (props) => {
  const { reposData } = props;
  return (
    <div className="dataContainer">
      <Row className="headerRow">
        <Col span={6}>Id</Col>
        <Col span={6}>Name</Col>
        <Col span={6}>Watchers</Col>
        <Col span={6}>Stars</Col>
      </Row>
      <Spin spinning={reposData.length === 0}>
        {reposData.map((data, index) => (
          <Row key={index} gutter={[8, 16]}>
            <Col span={6}>{data.id}</Col>
            <Col span={6}>{data.name}</Col>
            <Col span={6}>{data.watchers_count}</Col>
            <Col span={6}>{data.stargazers_count}</Col>
          </Row>
        ))}
      </Spin>
    </div>
  );
};

const App = () => {
  // record currentPage for api parameter
  const currentPage = useRef(1);

  // user search result will store in reposData
  const [reposData, setReposData] = React.useState([]);

  // keep original responds data for undo the search result
  const originalResData = useRef([]);

  const handleOrderByChange = (e) => {
    const sortedData = orderBy(
      originalResData.current,
      [e.target.value],
      ["desc"]
    );
    setReposData(sortedData);
  };

  const handleSearchChange = (value) => {
    // undo the search result
    if (value === "") {
      setReposData(originalResData.current);
    // get search result
    } else {
      const searchData = cloneDeep(originalResData.current).filter((data) =>
        data.name.includes(value)
      );
      setReposData(searchData);
    }
  };

  const handleScroll = () => {
    // if scroll reach to bottom will fetch new result
    if (
      window.innerHeight + document.documentElement.scrollTop !==
      document.documentElement.scrollHeight
    )
      return;

    // fetch next page
    currentPage.current = currentPage.current + 1;
    getReposByPage(currentPage.current).then((result) => {
      originalResData.current = originalResData.current.concat(result.data);
      setReposData(originalResData.current);
    });
  };

  useEffect(() => {
    // fetch first page once component mounted
    if (currentPage.current === 1) {
      // fetch first page
      getReposByPage(currentPage.current).then((result) => {
        originalResData.current = originalResData.current.concat(result.data);
        setReposData(originalResData.current);
      });
    }
    window.addEventListener("scroll", () => handleScroll());
    return () => window.removeEventListener("scroll", () => handleScroll());
  }, []);

  return (
    <div className="container">
      <Row justify="space-around">
        <Col span={7}>
          Sort BY: <SortContainer handleOrderByChange={handleOrderByChange} />
        </Col>
        <Col span={7}>
          Search: 
          <Search
            placeholder="search text"
            onSearch={handleSearchChange}
            style={{ width: 200 }}
          />
        </Col>
      </Row>
      <br />
      <DataContainer reposData={reposData} />
    </div>
  );
};

export default App;
