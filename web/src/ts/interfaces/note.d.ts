declare namespace Note {
  interface NoteParams {
    userId: number;
    bookId: number;
    dataPid: string;
    selectedText: string;
    content: string;
    highlightColor: string;
  }

  interface NotePreviewOrDeleteParams {
    userId: number;
    bookId: number;
    dataPid: string;
    highlightId: string;
  }
}
