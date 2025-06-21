import { AppDispatch, RootState } from "@/stores";
import {
  changeCurChat,
  changeSessionKey,
  getCurChatAction,
} from "@/stores/slice/chat";
import {
  changeActiveKey,
  changeItems,
  toggleCollapsed,
} from "@/stores/slice/session";
import { groupSessionsByDate } from "@/utils/group.util";
import {
  MenuFoldOutlined,
  DeleteOutlined,
  EditOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { Conversations, ConversationsProps } from "@ant-design/x";
import { Button, Flex, Input, message, Modal, Popconfirm } from "antd";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import style from "./index.module.scss";
import { getSessionListAction } from "@/stores/slice/user";
import { deleteSession, updateSession } from "@/services/api/session";
import { useNavigate } from "react-router-dom";
import { logout } from "@/services/api/login";

type SessionProps = {
  abort: React.MutableRefObject<() => void>;
};

const Session = (props: SessionProps) => {
  const { session, user } = useSelector((state: RootState) => state);
  const { abort } = props;
  const [editingSession, setEditingSession] = useState<{
    key: string;
    title: string;
    originalTitle: string;
  } | null>(null);
  // 在组件内添加退出方法
  const navigate = useNavigate();

  // Customize the style of the container
  const CustomizeStyle = {
    width: 240,
    padding: 0,
  };

  const dispatch = useDispatch<AppDispatch>();

  const handleAdd = () => {
    abort.current?.();
    dispatch(changeCurChat({ chat: "[]" }));
    dispatch(changeActiveKey("-1"));
    dispatch(changeSessionKey({ sessionKey: "0" }));
  };

  const handleLogout = async () => {
    await logout(); // 调用退出接口
    localStorage.clear();
    navigate("/login");
  };

  useEffect(() => {
    dispatch(
      changeItems([
        ...user.sessionList.map((item) => {
          return {
            key: item.id.toString(),
            label: item.title,
            group: groupSessionsByDate(item.update_time),
          };
        }),
      ])
    );
  }, [user.sessionList.length]);

  const handleChange = (key: string) => {
    abort.current?.();
    dispatch(changeActiveKey(key));
    dispatch(changeSessionKey({ sessionKey: key }));
    dispatch(getCurChatAction(key));
  };

  const menuConfig: ConversationsProps["menu"] = (conversation) => ({
    items: [
      {
        label: "编辑",
        key: "rename",
        icon: <EditOutlined />,
      },
      {
        label: "删除",
        key: "delete",
        icon: <DeleteOutlined />,
        danger: true,
      },
    ],
    onClick: async (menuInfo) => {
      menuInfo.domEvent.stopPropagation();
      if (menuInfo.key === "delete") {
        await deleteSession(conversation.key);
        dispatch(getSessionListAction(user.username)); // 刷新会话列表
        if (session.activeKey === conversation.key) {
          handleAdd();
        }
      }
      if (menuInfo.key === "rename") {
        setEditingSession({
          key: conversation.key,
          title: conversation.label.toLocaleString(),
          originalTitle: conversation.label.toLocaleString(),
        });
      }
    },
  });

  // 在会话列表组件中添加
  useEffect(() => {
    if (session.activeKey && !session.collapsed) {
      // 展开时滚动到选中项
      const activeItem = document.querySelector(
        `[data-key="${session.activeKey}"]`
      );
      activeItem?.scrollIntoView({ behavior: "smooth" });
    }
  }, [session.activeKey, session.collapsed]);

  const handleTitleChange = async () => {
    if (!editingSession) return;
    await updateSession(editingSession.key, { title: editingSession.title });
    const updatedItems = [
      // 更新后的会话项（带最新时间分组）
      {
        ...session.items.find((item) => item.key === editingSession.key)!,
        label: editingSession.title,
        group: "今天",
      },
      // 过滤掉原会话项后剩余会话
      ...session.items.filter((item) => item.key !== editingSession.key),
    ];
    dispatch(changeItems(updatedItems));
    setEditingSession(null);
  };

  return (
    <Flex gap="small" vertical>
      <Flex gap="middle" vertical>
        <Flex justify="space-between" align="center" vertical={false}>
          <span style={{ fontWeight: "bold", fontSize: "20px" }}>智阅书答</span>
          <Flex gap="small">
            <Popconfirm
              title="确认退出登录？"
              onConfirm={handleLogout}
              okText="确定"
              cancelText="取消"
            >
              <Button
                type="text"
                icon={<UserOutlined style={{ fontSize: 18 }} />}
              />
            </Popconfirm>
            <Button
              type="text"
              icon={<MenuFoldOutlined style={{ fontSize: 18 }} />}
              onClick={() => dispatch(toggleCollapsed())}
            />
          </Flex>
        </Flex>
        <Button
          type="dashed"
          style={{ minHeight: "32.8px" }}
          onClick={handleAdd}
        >
          新增对话
        </Button>
      </Flex>
      <Conversations
        className={style.conversationsWrap}
        activeKey={session.activeKey}
        style={CustomizeStyle}
        menu={menuConfig}
        onActiveChange={handleChange}
        items={session.items}
        groupable
      />
      <Modal
        title="修改会话标题"
        open={!!editingSession}
        onCancel={() => setEditingSession(null)}
        onOk={handleTitleChange}
        okButtonProps={{
          disabled:
            !editingSession ||
            editingSession.title.trim() === "" ||
            editingSession.title === editingSession.originalTitle,
        }}
      >
        <Input
          value={editingSession?.title || ""}
          onChange={(e) =>
            setEditingSession((prev) => ({
              ...prev!,
              title: e.target.value,
            }))
          }
          maxLength={20}
          showCount
        />
      </Modal>
    </Flex>
  );
};

export default Session;
