import { Entity, PrimaryColumn, Column, OneToOne } from 'typeorm';

@Entity()
export class NoteLocation {
  @PrimaryColumn({ name: 'note_id' })
  noteId: number;

  @Column('text', { comment: '用户选中的原始文本' })
  selectedText: string;

  @Column({
    name: 'highlight_color',
    comment: '高亮文本颜色',
    default: '#ffeb3b',
  })
  highlightColor: string;

  @Column({
    name: 'highlight_id',
    comment: '高亮唯一标识',
  })
  highlightId: string;

  @Column({ name: 'data_pid' })
  dataPid: string;
}
