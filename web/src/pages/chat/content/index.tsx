import { AppDispatch, RootState } from "@/stores";
import {
  Bubble,
  BubbleProps,
  Prompts,
  Sender,
  Suggestion,
  useXAgent,
  useXChat,
} from "@ant-design/x";
import { Flex, FloatButton, message, Select, Tooltip, Upload } from "antd";
import type { GetProp } from "antd";
import { useEffect, useMemo, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  EditTwoTone,
  UserOutlined,
  FileTextOutlined,
  CloudUploadOutlined,
} from "@ant-design/icons";
import { baseURL } from "@/services";
import { addSession, updateSession } from "@/services/api/session";
import "./index.scss";
import style from "./index.module.scss";
import MarkdownRenderer from "../markdown";
import { BubbleListProps } from "@ant-design/x/es/bubble/BubbleList";
import { changeActiveKey, changeItems } from "@/stores/slice/session";
import { groupSessionsByDate } from "@/utils/group.util";
import { UploadProps } from "antd/lib";
import { getSessionListAction } from "@/stores/slice/user";
import { changeModal } from "@/stores/slice/chat";
import { ChatType } from "@/ts/enums/chat";

type ChatContentProps = {
  setLibraryVisible: (visible: boolean) => void;
  beforeUpload?: (file: File) => Promise<string | false>;
  progress: number;
  setProgress: (value: number) => void;
  abort: React.MutableRefObject<() => void>;
};

// 修改组件状态
const ChatContent = (props: ChatContentProps) => {
  const { setLibraryVisible, beforeUpload, progress, abort } = props;
  const { chat, user, session, book } = useSelector(
    (state: RootState) => state
  );
  const chatRef = useRef<RootState["chat"]>(chat);
  const sessionRef = useRef<RootState["session"]>(session);
  const userRef = useRef<RootState["user"]>(user);
  const sessionsRef = useRef<Chat.ChatMessage[]>(JSON.parse(chat.chat));
  const sessionKeyRef = useRef(chatRef.current.sessionKey);
  const promptKeyRef = useRef<string>("");
  const lodingRef = useRef<boolean>(false);
  const inputRef = useRef(null);
  const [value, setValue] = useState("");
  const dispatch = useDispatch<AppDispatch>();
  const avatar = user.username ? user.username.split("")[0] : "匿";

  const uploadprops: UploadProps = {
    name: "file",
    multiple: false,
    showUploadList: false,
    accept: ".docx,.pdf,.txt",
    beforeUpload,
  };

  useEffect(() => {
    chatRef.current = chat;
    sessionsRef.current = JSON.parse(chat.chat);
    sessionKeyRef.current = chat.sessionKey;
  }, [chat]);

  const roles: GetProp<BubbleListProps, "roles"> = {
    ai: {
      placement: "start",
      avatar: { icon: <UserOutlined />, style: { background: "#fde3cf" } },
    },
    local: {
      placement: "end",
      avatar: { icon: avatar, style: { background: "#87d068" } },
    },
  };

  // 在 Redux 更新时同步 Ref
  useEffect(() => {
    chatRef.current = chat;
    sessionsRef.current = JSON.parse(chat.chat);
    sessionKeyRef.current = chat.sessionKey;
  }, [chat]);

  useEffect(() => {
    sessionRef.current = session;
  }, [session]);

  useEffect(() => {
    userRef.current = user;
  }, [user]);

  useEffect(() => {
    return () => {
      abort.current;
    };
  }, []);

  // 修剪过长的对话历史
  function trimConversationHistory(history: any[], maxLength = 10) {
    const newHistory = [...history];
    while (newHistory.length > maxLength) {
      if (newHistory[1].role === "system") {
        newHistory.splice(2, 1);
      } else {
        newHistory.splice(1, 1);
      }
    }
    return newHistory;
  }

  const [agent] = useXAgent<string, { message: string }, string>({
    request: async (info, callback) => {
      const { message: msg } = info;
      const { onSuccess, onUpdate, onError } = callback;
      lodingRef.current = true;
      onUpdate("");
      let newSessions = [...sessionsRef.current];
      let newItems = [...sessionRef.current.items];
      newSessions.push({ role: "user", content: msg });

      try {
        const token = localStorage.getItem("token");
        let res;

        if (promptKeyRef.current === "1") {
          res = await fetch(`${baseURL}/openai/rewrite`, {
            method: "POST",
            body: JSON.stringify({
              prompt: msg,
              modal: chatRef.current.modal,
              sessions: newSessions,
              bookId: userRef.current.selectedBookId,
            }),
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          });
        } else if (promptKeyRef.current === "2") {
          res = await fetch(`${baseURL}/openai/summary`, {
            method: "POST",
            body: JSON.stringify({
              prompt: "请根据文章内容生成摘要",
              modal: chatRef.current.modal,
              sessions: newSessions,
              bookId: userRef.current.selectedBookId,
            }),
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          });
        } else {
          res = await fetch(`${baseURL}/openai/chat`, {
            method: "POST",
            body: JSON.stringify({
              prompt: msg,
              modal: chatRef.current.modal,
              sessions: newSessions,
            }),
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          });
        }

        const reader = res.body!.getReader();
        const decoder = new TextDecoder();
        let result = "";

        abort.current = () => {
          reader.cancel();
        };

        while (true) {
          const { done, value } = await reader.read();
          if (done) {
            newSessions.push({ role: "assistant", content: result });
            newSessions = trimConversationHistory(newSessions);
            // 合并历史记录和新消息
            const updatedSessions: Chat.ChatMessage[] = [
              ...sessionsRef.current,
              { role: "user", content: msg },
              { role: "assistant", content: result },
            ];
            if (sessionRef.current.activeKey === "-1") {
              const res = await addSession({
                title: msg.slice(0, 10),
                chat: JSON.stringify(newSessions),
              });
              sessionKeyRef.current = JSON.stringify(res.data);
              dispatch(
                changeItems([
                  {
                    key: res.data.toString(),
                    label: msg.slice(0, 10),
                    group: groupSessionsByDate(new Date().toLocaleString()),
                  },
                  ...newItems,
                ])
              );
              dispatch(changeActiveKey(res.data.toString()));
              dispatch(getSessionListAction(userRef.current.username)); // 强制刷新会话列表
            } else {
              await updateSession(sessionKeyRef.current, {
                chat: JSON.stringify(updatedSessions),
              });
            }
            sessionsRef.current = updatedSessions; // 更新会话引用
            break;
          }

          const chunk = decoder.decode(value);
          result += chunk;
          lodingRef.current = false;
          onUpdate(result);
        }
        promptKeyRef.current = "";
        onSuccess([result]);
      } catch (error) {
        // handle error
        console.error(error);
        onError(new Error("模型出错"));
        message.error("模型出错");
      }
    },
  });

  const {
    // use to send message
    onRequest,
    // use to render messages
    messages,
    setMessages,
  } = useXChat({
    agent,
  });

  useEffect(() => {
    setMessages([]);
  }, [chat.sessionKey]);

  useEffect(() => {
    if (session.activeKey === "-1") {
      setMessages([]);
    }
  }, [session.activeKey]);

  const items = useMemo((): (BubbleProps & {
    key?: string | number;
    role?: string;
  })[] => {
    return messages.map(({ message, id, status }) => ({
      // key is required, used to identify the message
      key: id,
      content: message,
      loading: status === "loading" && lodingRef.current,
      role: status === "local" ? "local" : "ai",
      messageRender: (content: string) => (
        <div>
          <MarkdownRenderer content={content} />
        </div>
      ),
    }));
  }, [messages]);

  const historyMsg = useMemo((): (BubbleProps & {
    key?: string | number;
    role?: string;
  })[] => {
    return JSON.parse(chat.chat).map(
      (item: Chat.ChatMessage, index: number) => ({
        key: `history-${index}`,
        content: item.content,
        role: item.role === "user" ? "local" : "ai",
        messageRender: (content: string) => (
          <div>
            <MarkdownRenderer content={content} />
          </div>
        ),
      })
    );
  }, [sessionRef.current, chat.chat]);

  const handleItemClick = (info: any) => {
    const { key } = info.data;
    const bookId = user.selectedBookId;
    if (!bookId) {
      message.warning("请选择一篇文章");
      return;
    }
    promptKeyRef.current = key;
    if (key === "1") {
      setValue("改写要求：");
      inputRef.current?.focus();
    }
    if (key === "2") {
      onRequest("生成摘要");
    }
  };

  return (
    <Flex vertical style={{ flex: 1 }} gap={8} className={style.listWrap}>
      {!session.collapsed ? (
        <Flex
          vertical
          align="center"
          justify="center"
          style={{
            position: "absolute",
          }}
        >
          <FloatButton.Group
            shape="square"
            style={{ position: "relative", top: 0, left: 0 }}
          >
            {/* 文章库按钮 */}
            <Tooltip id="open" title="打开文章库" placement="right">
              <FloatButton
                icon={<FileTextOutlined />}
                onClick={() => setLibraryVisible(true)}
              />
            </Tooltip>
            {/* 上传按钮 */}
            <Tooltip id="open" title="上传文章" placement="right">
              <Upload {...uploadprops}>
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
      ) : null}
      <Bubble.List
        roles={roles}
        style={{ flex: 1, paddingRight: "10px", paddingLeft: "46px" }}
        items={[...historyMsg, ...items]}
      />
      <Prompts
        items={[
          {
            key: "1",
            icon: <EditTwoTone style={{ color: "#FFD700" }} />,
            label: "文章改写",
          },
          {
            key: "2",
            icon: <FileTextOutlined style={{ color: "#1890ff" }} />,
            label: "生成摘要",
          },
        ]}
        onItemClick={handleItemClick}
      />
      <Suggestion items={[]}>
        {({ onTrigger, onKeyDown }) => {
          return (
            <Sender
              className="w-1"
              ref={inputRef}
              value={value}
              autoSize={{ minRows: 1, maxRows: 5 }}
              footer={({ components }) => {
                const { SendButton, LoadingButton } = components;
                return (
                  <Flex justify="space-between" align="center">
                    <Select
                      defaultValue={chat.modal}
                      style={{ width: 180 }}
                      onChange={(value) =>
                        dispatch(changeModal({ modal: value as ChatType }))
                      }
                      options={Object.entries(ChatType)
                        .filter(([key]) => isNaN(Number(key)))
                        .map(([label, value]) => ({ label, value }))}
                    />

                    {agent.isRequesting() ? (
                      <LoadingButton type="default" />
                    ) : (
                      <SendButton type="primary" disabled={false} />
                    )}
                  </Flex>
                );
              }}
              onCancel={() => {
                abort.current?.();
              }}
              onChange={(nextVal: any) => {
                if (nextVal === "/") {
                  onTrigger();
                } else if (!nextVal) {
                  onTrigger(false);
                }
                setValue(nextVal);
              }}
              onSubmit={(content: string) => {
                onRequest(content);
                setValue("");
              }}
              onKeyDown={onKeyDown}
              actions={false}
            />
          );
        }}
      </Suggestion>
    </Flex>
  );
};

export default ChatContent;
