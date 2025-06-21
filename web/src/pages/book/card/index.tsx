import { Card, Input, message, Radio, Tooltip } from "antd";
import {
  DeleteOutlined,
  FileWordOutlined,
  FilePdfOutlined,
  FileTextOutlined,
} from "@ant-design/icons";
import Meta from "antd/es/card/Meta";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/stores";
import {
  changeBookList,
  changeBookPreview,
  getBookListAction,
} from "@/stores/slice/book";
import { deleteBook, preview, updateBookTitle } from "@/services/api/book";
import { changeSelectedBookId } from "@/stores/slice/user";
import { useState } from "react";
import { changeCollapsed } from "@/stores/slice/session";

type BookCardProps = {
  id: string;
  title: string;
  checked: boolean;
  fileExtension: string;
  setLibraryVisible: (visible: boolean) => void;
};

const BookCard = (props: BookCardProps) => {
  const { title, checked, id, setLibraryVisible, fileExtension } = props;
  const dispatch = useDispatch<AppDispatch>();
  const { book, user } = useSelector((state: RootState) => state);
  const [editing, setEditing] = useState<boolean>(false);
  const [newTitle, setNewTitle] = useState("");

  const handleChoose = () => {
    const newBookList = book.bookList.map((item) => ({
      ...item,
      checked: item.key === id ? !item.checked : false,
    }));
    dispatch(changeBookList(newBookList));
    dispatch(changeSelectedBookId(checked ? id : null));
  };

  // 在组件内部添加文件类型判断逻辑
  const getFileTypeIcon = (extension: string) => {
    if (extension === "docx")
      return <FileWordOutlined style={{ fontSize: 64, color: "#1890ff" }} />;
    if (extension === "pdf")
      return <FilePdfOutlined style={{ fontSize: 64, color: "#ff4d4f" }} />;
    if (extension === "txt")
      return <FileTextOutlined style={{ fontSize: 64, color: "#52c41a" }} />;
    return <FileTextOutlined style={{ fontSize: 64 }} />;
  };

  const handleTitleChange = async (id: string) => {
    if (!newTitle.trim()) {
      setEditing(false);
      message.warning("标题不能为空");
      return;
    }

    try {
      await updateBookTitle(id, newTitle);
      dispatch(getBookListAction(user.username));
    } finally {
      setEditing(false);
    }
  };

  const handleDelete = async () => {
    const res = await deleteBook(id);
    if (user.selectedBookId === id) {
      dispatch(changeSelectedBookId(null));
    }
    if (res.code === 200) {
      dispatch(getBookListAction(user.username));
    }
  };

  const handlePreview = async () => {
    setLibraryVisible(false);
    dispatch(changeCollapsed(true));
    const newBookList = book.bookList.map((item) => ({
      ...item,
      checked: item.key === id ? true: false,
    }));
    dispatch(changeBookList(newBookList));
    dispatch(changeSelectedBookId(id));
    const { data } = await preview(+id);
    dispatch(
      changeBookPreview({
        isPreview: true,
        content: "",
        previewId: +id,
        rawData: data,
      })
    );
  };

  return (
    <Card
      style={{ width: 180 }}
      cover={
        <div
          style={{
            height: 120,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {getFileTypeIcon(fileExtension)}
        </div>
      }
      actions={[
        <Radio
          checked={checked}
          key="choose"
          onClick={handleChoose}
          value={id}
        ></Radio>,
        <p key="preview" onClick={handlePreview}>
          阅读
        </p>,
        <DeleteOutlined key="delete" onClick={handleDelete} />,
      ]}
    >
      <Meta
        description={
          <Tooltip title={title}>
            {editing ? (
              <Input
                autoFocus
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                onBlur={() => handleTitleChange(id)}
                onPressEnter={() => handleTitleChange(id)}
                style={{ width: "100%" }}
              />
            ) : (
              <span
                style={{
                  color: "black",
                  display: "inline-block",
                  width: "100%",
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
                onDoubleClick={() => {
                  setEditing(true);
                  setNewTitle(title);
                }}
              >
                {title}
              </span>
            )}
          </Tooltip>
        }
      />
    </Card>
  );
};

export default BookCard;
