import { AppDispatch, RootState } from "@/stores";
import { changeBookPreview } from "@/stores/slice/book";
import { Button, message } from "antd";
import { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import NoteModal from "../note";
import { addNote, deleteNote, previewNote } from "@/services/api/note";
import { preview } from "@/services/api/book";

const FilePreview = () => {
  // 修改后（正确用法）：
  const { previewId, rawData } = useSelector((state: RootState) => state.book);
  const { selectedBookId: bookId } = useSelector(
    (state: RootState) => state.user
  );
  const [noteVisible, setNoteVisible] = useState(false);
  const [highlightId, setHighlightId] = useState<string>("");
  const [selectedPara, setSelectedPara] = useState<{
    pid: string;
    content: string;
  }>({ pid: "", content: "" });
  const contentRef = useRef<HTMLDivElement>(null);
  const [noteContent, setNoteContent] = useState("");
  const dispatch = useDispatch<AppDispatch>();

  useEffect(() => {
    if (previewId && rawData?.html) {
      contentRef.current!.innerHTML = rawData.html;
    }
  }, [previewId, rawData]);

  const hanldeExit = () => {
    dispatch(
      changeBookPreview({
        isPreview: false,
        previewId: 0,
      })
    );
  };

  const handleHighlightClick = async (e: Event) => {
    const target = e.target as HTMLElement;
    const highlightId = target.id;
    const pTarget = target.closest(".content-para") as HTMLElement;
    const pid = pTarget?.dataset.pid || "";

    setHighlightId(highlightId);
    setSelectedPara({
      pid,
      content: target.textContent || "",
    });
    const previewParams = {
      userId: parseInt(localStorage.getItem("id")),
      bookId: +bookId,
      highlightId,
      dataPid: pid,
    };

    // 调用预览接口
    const res = await previewNote(previewParams);

    setNoteContent(res.data);
    setNoteVisible(true);
  };

  const handleSelect = (e: Event) => {
    const el = e.currentTarget as HTMLElement;
    const selection = window.getSelection();

    if (selection && selection.rangeCount > 0 && !selection.isCollapsed) {
      const range = selection.getRangeAt(0);
      // 增加选中内容长度判断
      if (range.toString().trim().length < 1) return;

      setSelectedPara({
        pid: el.dataset.pid || "",
        content: selection.toString().trim(),
      });
      setNoteVisible(true);
    }
  };

  // 段落点击处理
  useEffect(() => {
    const paras = document.querySelectorAll(".content-para");
    const highlights = contentRef.current?.querySelectorAll(".highlight");

    paras.forEach((p) => p.addEventListener("click", handleSelect));
    highlights?.forEach((h) =>
      h.addEventListener("click", handleHighlightClick)
    );

    // 清理事件监听
    return () => {
      paras.forEach((p) => p.removeEventListener("click", handleSelect));
      highlights?.forEach((h) =>
        h.removeEventListener("click", handleHighlightClick)
      );
    };
  }, [rawData]); // rawData变化时重新绑定

  const handleNoteSubmit = async (content: string) => {
    if (!content && highlightId) {
      // 删除笔记
      const deleteParams = {
        userId: parseInt(localStorage.getItem("id")),
        bookId: +bookId,
        highlightId,
        dataPid: selectedPara.pid,
      };
      await deleteNote(deleteParams);
      setNoteVisible(false);
      const { data } = await preview(previewId);
      dispatch(
        changeBookPreview({
          isPreview: true,
          content: "",
          previewId: previewId,
          rawData: data,
        })
      );
      setNoteContent("");
      return;
    } else if (!content) {
      message.error("笔记内容不能为空");
      return;
    }
    const addParams = {
      dataPid: selectedPara.pid,
      content,
      selectedText: selectedPara.content,
      userId: parseInt(localStorage.getItem("id")),
      bookId: +bookId,
      highlightColor: "ffeb3b",
    };
    await addNote(addParams);
    setNoteVisible(false);
    const { data } = await preview(previewId);
    dispatch(
      changeBookPreview({
        isPreview: true,
        content: "",
        previewId: previewId,
        rawData: data,
      })
    );
    setNoteContent("");
  };

  return (
    <div className="preview-container" style={{ width: 700 }}>
      <Button type="primary" onClick={hanldeExit}>
        退出预览
      </Button>
      <div
        ref={contentRef}
        style={{
          marginTop: 20,
          padding: 24,
          background: "white",
          borderRadius: 8,
          boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
          overflow: "auto",
          maxHeight: "80vh",
          lineHeight: 1.8,
        }}
      />
      <NoteModal
        visible={noteVisible}
        selectedPara={selectedPara}
        initialContent={noteContent}
        onOk={handleNoteSubmit}
        onCancel={() => {
          setNoteVisible(false);
          setNoteContent("");
          setHighlightId("");
        }}
      />
    </div>
  );
};

export default FilePreview;
