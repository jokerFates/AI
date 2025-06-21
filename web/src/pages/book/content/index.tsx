import { Col, Flex, Input, Row } from "antd";
import BookCard from "../card";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/stores";
import { useState } from "react";
import { changeBookList } from "@/stores/slice/book";
import { getBookList } from "@/services/api/book";

type BookContentProps = {
  setLibraryVisible: (visible: boolean) => void;
};

const BookContent = (props: BookContentProps) => {
  const { setLibraryVisible } = props;
  const { book, user } = useSelector((state: RootState) => state);
  const dispatch = useDispatch<AppDispatch>();
  // 新增搜索状态
  const [searchText, setSearchText] = useState("");
  const filteredList = book.bookList.filter((item) =>
    item.title.toLowerCase().includes(searchText.toLowerCase())
  );

  const handleSearch = async (title: string) => {
    const res = await getBookList(user.username, title);
    const { data } = res;
    const newList = data.map((item) => ({
      key: item.id.toString(),
      checked: false,
      title: item.name.split(item.fileType)[0],
      fileExtension: item.fileExtension,
    }));
    dispatch(changeBookList(newList));
  };

  return (
    <Flex
      vertical
      align="center"
      style={{
        width: "100%",
        height: "100%",
        padding: "0 16px",
      }}
    >
      <div style={{ width: "100%", padding: "16px 0" }}>
        <Input.Search
          placeholder="输入文章名称搜索"
          allowClear
          onChange={(e) => setSearchText(e.target.value)}
          onSearch={() => {
            handleSearch(searchText);
          }}
          onClear={() => {
            handleSearch("");
          }}
          style={{ maxWidth: 400, marginBottom: 16 }}
        />
      </div>
      <Row
        gutter={[16, 16]}
        style={{
          width: "100%",
          height: "calc(100% - 46px)",
          overflowY: "auto",
          paddingRight: 8,
        }}
      >
        {filteredList.map((item) => (
          <Col key={item.key} span={6}>
            <BookCard
              id={item.key}
              title={item.title}
              checked={item.checked}
              fileExtension={item.fileExtension}
              setLibraryVisible={setLibraryVisible}
            />
          </Col>
        ))}
      </Row>
    </Flex>
  );
};

export default BookContent;
