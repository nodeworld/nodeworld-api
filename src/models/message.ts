import { IsIn, IsNotEmpty, MaxLength, validate } from "class-validator";
import {
    BeforeInsert,
    BeforeUpdate,
    Column,
    CreateDateColumn,
    Entity,
    JoinColumn,
    ManyToOne,
    PrimaryColumn,
} from "typeorm";
import { v1 as uuidv1 } from "uuid";

import { MAX_CHARACTER_LIMIT } from "../constants/message.constants";

import { Node } from "./node";
import { Visitor } from "./visitor";

export enum MessageType {
    SYSTEM = 0,
    CHAT = 1,
    ACTION = 2,
}

@Entity()
export class Message {
    @PrimaryColumn("uuid")
    public id: string;

    @Column({ nullable: false })
    // tslint:disable-next-line:variable-name
    public author_id: string;

    @Column({ nullable: false })
    // tslint:disable-next-line:variable-name
    public node_id: string;

    @ManyToOne(type => Visitor, visitor => visitor.messages, { nullable: false })
    @JoinColumn({ name: "author_id" })
    public author: Visitor;

    @ManyToOne(type => Node, node => node.messages, { nullable: false })
    @JoinColumn({ name: "node_id" })
    public node: Node;

    @IsIn(Object.values(MessageType).filter(t => typeof t === "number"))
    @Column("int")
    public type: number;

    @IsNotEmpty()
    @Column("text", { nullable: true })
    public name: string;

    @IsNotEmpty()
    @MaxLength(MAX_CHARACTER_LIMIT)
    @Column("text")
    public content: string;

    @CreateDateColumn()
    // tslint:disable-next-line:variable-name
    public sent_at: Date;

    constructor(config: MessageConfig) {
        if (config) {
            this.id = uuidv1();
            this.author = config.author;
            this.node = config.node;
            this.type = config.type;
            this.name = config.name;
            this.content = config.content;
        }
    }

    public safe() {
        return {
            id: this.id,
            author_id: this.author ? this.author.id : this.author_id,
            node_id: this.node ? this.node.id : this.node_id,
            type: this.type,
            name: this.name,
            content: this.content,
        };
    }

    @BeforeInsert()
    @BeforeUpdate()
    private async validate() {
        const errors = await validate(this, { validationError: { target: false } });
        if (errors.length) throw errors[0];
    }
}

export interface MessageConfig {
    author: Visitor;
    node: Node;
    type: MessageType;
    name: string;
    content: string;
}
