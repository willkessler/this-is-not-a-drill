import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from './Users.entity';
import { Organization } from './Organizations.entity';

@Entity('user_organizations')
export class UserOrganization {
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => User, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'user_uuid' })
    user: User;

    @ManyToOne(() => Organization, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'organization_uuid' })
    organization: Organization;

    @Column({
        type: 'enum',
        enum: ['Admin', 'Member', 'Guest'],
        default: 'Member'
    })
    role: string;
}
