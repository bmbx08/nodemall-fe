import React, {useEffect, useState} from "react";
import {Container, Button, Dropdown} from "react-bootstrap";
import {useDispatch, useSelector} from "react-redux";
import {useSearchParams, useNavigate} from "react-router-dom";
import ReactPaginate from "react-paginate";
import SearchBox from "../../common/component/SearchBox";
import NewItemDialog from "./component/NewItemDialog";
import ProductTable from "./component/ProductTable";
import {
  getProductList,
  deleteProduct,
  setSelectedProduct,
} from "../../features/product/productSlice";

const AdminProductPage = () => {
  const navigate = useNavigate();
  const [query] = useSearchParams();
  const dispatch = useDispatch();
  const {productList, totalPageNum} = useSelector((state) => state.product);
  const [showDialog, setShowDialog] = useState(false);
  const [searchQuery, setSearchQuery] = useState({
    page: query.get("page") || 1,
    name: query.get("name") || "",
    option: query.get("option") || "",
  }); //검색 조건들을 저장하는 객체

  const [mode, setMode] = useState("new");

  const tableHeader = [
    "#",
    "Sku",
    "Name",
    "Price",
    "Stock",
    "Image",
    "Status",
    "",
  ];

  const [option, setOption] = useState("정확도순");
  const optionList = [
    "정확도순",
    "가격높은순",
    "가격낮은순",
    "최신순",
    "오래된순",
  ];

  //상품리스트 가져오기 (url쿼리 맞춰서)
  useEffect(() => {
    dispatch(getProductList({...searchQuery}));
  }, [query]);

  useEffect(() => {
    //검색어나 페이지가 바뀌면 url바꿔주기 (검색어또는 페이지가 바뀜 => url 바꿔줌=> url쿼리 읽어옴=> 이 쿼리값 맞춰서  상품리스트 가져오기)
    if (searchQuery.name === "") {
      delete searchQuery.name;
    }
    if(searchQuery.option ==="") {
      delete searchQuery.option;
    }
    // console.log("search query", searchQuery);
    const params = new URLSearchParams(searchQuery); //URLSearchParams가 객체 형태인 searchQuery를 query형태로 바꿔줌
    const query = params.toString(); //그리고 string 형태로 변환해야지 사용가능
    console.log("queryy", query);
    navigate("?" + query);
  }, [searchQuery]);

  const deleteItem = (id) => {
    //아이템 삭제하기
    dispatch(deleteProduct(id));
  };

  const openEditForm = (product) => {
    //edit모드로 설정하고
    setMode("edit");
    // 아이템 수정다이얼로그 열어주기
    dispatch(setSelectedProduct(product));
    setShowDialog(true);
  };

  const handleClickNewItem = () => {
    //new 모드로 설정하고
    setMode("new");
    // 다이얼로그 열어주기
    setShowDialog(true);
  };

  const handlePageClick = ({selected}) => {
    //  쿼리에 페이지값 바꿔주기
    console.log("selected data", selected);
    setSearchQuery({...searchQuery, page: selected + 1});
  };

  const selectOption = (value) => {
    setOption(value);
    setSearchQuery({...searchQuery, page:1, option: value})
    // navigate(`?option=${value}`);
  };

  //searchbox에서 검색어를 읽어온다 =>  엔터를 치면 => searchQuery객체가 업데이트가 됨 {name: 스트레이트 팬츠}
  //=>searchQuery객체 안에 아이템 기준으로 url을 새로 생성해서 호출 &name=스트레이트+팬츠 => url쿼리 읽어오기 => url쿼리 기준으로 BE에 검색조건과함께 호출한다.

  return (
    <div className="locate-center">
      <Container>
        <div className="mt-2">
          <SearchBox
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            placeholder="제품 이름으로 검색"
            field="name"
          />
        </div>
        <div>
          <Button className="mt-2 mb-2" onClick={handleClickNewItem}>
            Add New Item +
          </Button>

          <Dropdown
            className="landing-drop-down mb-3"
            title={option}
            align="end"
            onSelect={(value) => selectOption(value)}
          >
            <Dropdown.Toggle
              className="landing-drop-down"
              variant="outline-dark"
              id="dropdown-basic"
              align="end"
            >
              {/* {option === "" ? "정확도순" : option} */}
              {option}
            </Dropdown.Toggle>

            <Dropdown.Menu className="landing-drop-down">
              {/* {Object.keys(selectedProduct.stock).length > 0 &&
                      Object.keys(selectedProduct.stock).map((item, index) =>
                        selectedProduct.stock[item] > 0 ? (
                          <Dropdown.Item eventKey={item} key={index}>
                            {item.toUpperCase()}
                          </Dropdown.Item>
                        ) : (
                          <Dropdown.Item eventKey={item} disabled={true} key={index}>
                            {item.toUpperCase()}
                          </Dropdown.Item>
                        )
                      )} */}
              {optionList.map((option, index) => (
                <Dropdown.Item eventKey={option} key={index}>
                  {option}
                </Dropdown.Item>
              ))}
            </Dropdown.Menu>
          </Dropdown>
        </div>

        <ProductTable
          header={tableHeader}
          data={productList}
          deleteItem={deleteItem}
          openEditForm={openEditForm}
        />
        <ReactPaginate
          nextLabel="next >"
          onPageChange={handlePageClick}
          pageRangeDisplayed={5} //
          pageCount={totalPageNum} //전체페이지 수
          forcePage={searchQuery.page - 1}
          previousLabel="< previous"
          renderOnZeroPageCount={null}
          pageClassName="page-item"
          pageLinkClassName="page-link"
          previousClassName="page-item"
          previousLinkClassName="page-link"
          nextClassName="page-item"
          nextLinkClassName="page-link"
          breakLabel="..."
          breakClassName="page-item"
          breakLinkClassName="page-link"
          containerClassName="pagination"
          activeClassName="active"
          className="display-center list-style-none"
        />
      </Container>

      <NewItemDialog
        mode={mode}
        showDialog={showDialog}
        setShowDialog={setShowDialog}
      />
    </div>
  );
};

export default AdminProductPage;
