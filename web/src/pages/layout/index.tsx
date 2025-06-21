import type { ProSettings } from "@ant-design/pro-components";
import { ProLayout } from "@ant-design/pro-components";
import defaultProps from "./default";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/stores";
import {
  Divider,
  Flex,
  message,
  Modal,
  Tooltip,
  Upload,
  UploadProps,
} from "antd";
import { XProvider } from "@ant-design/x";
import {
  MenuUnfoldOutlined,
  FileTextOutlined,
  CloudUploadOutlined,
} from "@ant-design/icons";
import Session from "../chat/session";
import ChatContent from "../chat/content";
import { useEffect, useRef, useState } from "react";
import { getSessionListAction } from "@/stores/slice/user";
import { changeActiveKey, toggleCollapsed } from "@/stores/slice/session";
import BookContent from "../book/content";
import { getBookListAction } from "@/stores/slice/book";
import FilePreview from "../book/preview";
import { FloatButton } from "antd/lib";
import useFileUploader from "@/hooks/useFileUploader";

export default () => {
  const settings: ProSettings | undefined = {
    fixSiderbar: true,
    layout: "top",
    splitMenus: true,
    headerRender: false,
  };
  const { user, session, book } = useSelector((state: RootState) => state);
  const abortRef = useRef(() => {});
  const dispatch = useDispatch<AppDispatch>();
  const [libraryVisible, setLibraryVisible] = useState(false);

  const { progress, initUpload, handleUpload, setProgress } = useFileUploader();
  const beforeUpload = async (file: File) => {
    // 添加文件类型验证
    const allowedTypes = [
      "application/pdf",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "text/plain",
    ];
    const allowedExtensions = [".docx", ".pdf", ".txt"];

    // 获取文件后缀
    const extension = file.name.slice(file.name.lastIndexOf("."));

    if (
      !allowedTypes.includes(file.type) ||
      !allowedExtensions.includes(extension.toLowerCase())
    ) {
      message.warning("只能上传 DOCX/PDF/TXT 格式文件!");
      return Upload.LIST_IGNORE; // 阻止上传
    }

    await initUpload(file);
    handleUpload(file);
    return false;
  };
  const props: UploadProps = {
    name: "file",
    multiple: false,
    showUploadList: false,
    accept: ".docx,.pdf,.txt",
    beforeUpload,
  };

  useEffect(() => {
    dispatch(changeActiveKey("-1"));
    dispatch(getBookListAction(user.username));
    dispatch(getSessionListAction(user.username));
  }, []);

  return (
    <div
      id="test-pro-layout"
      style={{
        height: "100vh",
      }}
    >
      <ProLayout {...defaultProps} {...settings}>
        <XProvider direction="ltr">
          <Flex style={{ height: "90vh" }} gap={12}>
            {/* 会话栏（动态宽度） */}
            {!session.collapsed ? (
              <>
                <Session abort={abortRef} />
                <Divider type="vertical" style={{ height: "100%" }} />
              </>
            ) : (
              <Flex
                vertical
                align="center"
                justify="center"
                style={{
                  position: "fixed",
                  top: 70,
                  left: 40,
                }}
              >
                <FloatButton.Group
                  shape="circle"
                  style={{ position: "relative" }}
                >
                  <Tooltip id="open" title="打开侧边栏" placement="right">
                    <FloatButton
                      icon={<MenuUnfoldOutlined style={{ fontSize: 18 }} />}
                      onClick={() => dispatch(toggleCollapsed())}
                    />
                  </Tooltip>
                  {/* 文章库按钮 */}
                  <Tooltip id="open" title="打开文章库" placement="right">
                    <FloatButton
                      icon={<FileTextOutlined />}
                      onClick={() => setLibraryVisible(true)}
                    />
                  </Tooltip>
                  {/* 上传按钮 */}
                  <Tooltip id="open" title="上传文章" placement="right">
                    <Upload {...props}>
                      <FloatButton icon={<CloudUploadOutlined />} />
                    </Upload>
                  </Tooltip>
                  {book.isUploading ? (
                    <span style={{ fontSize: 12, fontWeight: "normal" }}>
                      {progress >= 100 ? "解析中" : progress + "%"}
                    </span>
                  ) : null}
                </FloatButton.Group>
              </Flex>
            )}
            <ChatContent
              setLibraryVisible={setLibraryVisible}
              beforeUpload={beforeUpload}
              progress={progress}
              setProgress={setProgress}
              abort={abortRef}
            />
            {book.isPreview ? (
              <>
                <Divider type="vertical" style={{ height: "100%" }} />
                <FilePreview></FilePreview>
              </>
            ) : null}
          </Flex>
        </XProvider>
        <Modal
          title="文章库"
          open={libraryVisible}
          onCancel={() => setLibraryVisible(false)}
          footer={null}
          width={900}
          styles={{
            body: {
              height: "75vh",
              overflowY: "auto",
              overflowX: "hidden",
              padding: "16px 0",
            },
          }}
        >
          <BookContent setLibraryVisible={setLibraryVisible} />
        </Modal>
      </ProLayout>
    </div>
  );
};
