import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('book')
export class Book {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({ name: 'file_type' }) // 新增文件类型字段
  fileType: string;

  @Column({ name: 'file_extension' }) // 新增文件后缀字段
  fileExtension: string;

  @Column({ name: 'user_account' }) // 新增用户账户名字段
  userAccount: string;

  @Column({ type: 'varchar', name: 'file_md5' }) // 用于秒传的文件唯一标识
  fileMd5: string;

  @Column({ type: 'bigint' }) // 文件大小
  size: number;

  @Column({ type: 'varchar' }) // 文件存储路径
  path: string;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  create_time: Date;

  @Column({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
    onUpdate: 'CURRENT_TIMESTAMP',
  })
  update_time: Date;
}
