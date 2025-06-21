import { Modal, Input, message } from "antd";
import { useState, useEffect, useRef } from "react";
import type { DraggableEvent, DraggableData } from "react-draggable";
import Draggable from "react-draggable";

type NoteModalProps = {
  visible: boolean;
  selectedPara: {
    pid: string;
    content: string;
  };
  initialContent?: string;
  onOk: (content: string) => Promise<void>;
  onCancel: () => void;
};

const NoteModal = ({
  visible,
  selectedPara,
  initialContent = "",
  onOk,
  onCancel,
}: NoteModalProps) => {
  const [noteContent, setNoteContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [bounds, setBounds] = useState({
    left: 0,
    top: 0,
    bottom: 0,
    right: 0,
  });
  const draggleRef = useRef<HTMLDivElement>(null);

  const handleSubmit = async () => {
    try {
      setLoading(true);
      await onOk(noteContent);
    } finally {
      setLoading(false);
    }
  };

  // 新增预览模式效果
  useEffect(() => {
    if (visible) {
      setNoteContent(initialContent ? initialContent : "");
    }
  }, [visible]);

  // 新增拖拽边界处理
  const onStart = (_event: DraggableEvent, uiData: DraggableData) => {
    const { clientWidth, clientHeight } = document.documentElement;
    const targetRect = draggleRef.current?.getBoundingClientRect();
    if (!targetRect) return;

    setBounds({
      left: -targetRect.left + uiData.x,
      right: clientWidth - (targetRect.right - uiData.x),
      top: -targetRect.top + uiData.y,
      bottom: clientHeight - (targetRect.bottom - uiData.y),
    });
  };

  return (
    <Modal
      open={visible}
      width={500}
      height={300}
      confirmLoading={loading}
      maskClosable={false}
      closable={false}
      mask={false}
      onOk={handleSubmit}
      onCancel={onCancel}
      modalRender={(modal) => (
        <Draggable
          bounds={bounds}
          onStart={(event, uiData) => onStart(event, uiData)}
          nodeRef={draggleRef}
          cancel=".ant-input"
        >
          <div ref={draggleRef}>{modal}</div>
        </Draggable>
      )}
    >
      <Input.TextArea
        rows={4}
        value={noteContent}
        onChange={(e) => setNoteContent(e.target.value)}
        placeholder="输入您的笔记..."
      />
      {selectedPara.content && (
        <div style={{ marginTop: 8, color: "#666" }}>
          选中内容: {selectedPara.content}
        </div>
      )}
    </Modal>
  );
};

export default NoteModal;
