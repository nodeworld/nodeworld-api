import { IsAlphanumeric, IsNotEmpty, IsOptional, validate } from "class-validator";
import {
    BeforeInsert,
    BeforeUpdate,
    Column,
    Entity,
    JoinColumn,
    ManyToOne,
    OneToMany,
    PrimaryColumn,
} from "typeorm";
import { v1 as uuidv1 } from "uuid";

import { Command } from "./command";
import { Message } from "./message";
import { Visitor } from "./visitor";

@Entity()
export class Node {
    @PrimaryColumn("uuid")
    public id: string;

    @Column({ nullable: false })
    // tslint:disable-next-line:variable-name
    public owner_id: string;

    @ManyToOne(type => Visitor, visitor => visitor.nodes, { onDelete: "CASCADE", nullable: false })
    @JoinColumn({ name: "owner_id" })
    public owner: Visitor;

    @OneToMany(type => Message, message => message.node)
    public messages: Message[];

    @OneToMany(type => Command, command => command.node)
    public commands: Command[];

    @IsAlphanumeric()
    @IsNotEmpty()
    @Column("text", { unique: true })
    public name: string;

    @IsOptional()
    @Column("text", { nullable: true })
    public greeting: string | null;

    constructor(config: NodeConfig) {
        if (config) {
            this.id = uuidv1();
            this.owner = config.owner;
            this.name = config.name;
            this.greeting = config.greeting || null;
        }
    }

    public safe() {
        if (this.owner) {
            return {
                id: this.id, name: this.name, greeting: this.greeting, owner_id: this.owner.id,
            };
        }
        return {
            id: this.id, name: this.name, greeting: this.greeting, owner_id: this.owner_id,
        };
    }

    @BeforeInsert()
    @BeforeUpdate()
    private async validate() {
        const errors = await validate(this, { validationError: { target: false } });
        if (errors.length) throw errors[0];
    }
}

export interface NodeConfig {
    name: string;
    greeting?: string;
    owner: Visitor;
}
