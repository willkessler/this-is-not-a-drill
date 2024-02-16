import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from './Users.entity';
import { Organization } from './Organizations.entity';

@Entity('user_organizations')
export class UserOrganization {
    @PrimaryGeneratedColumn('uuid')
    uuid: number;

    @Column({ name: 'created_at', type: 'timestamp', nullable: false })
    createdAt: Date;

    @ManyToOne(() => User, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'user_uuid' })
    user: User;

    @ManyToOne(() => Organization, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'organization_uuid' })
    organization: Organization;

    @Column({
        name: 'role',
        type: 'enum',
        enum: ['Admin', 'Member', 'Guest'],
        default: 'Member'
    })
    role: string;
}
