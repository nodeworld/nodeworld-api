import { Entity, PrimaryColumn, ManyToOne, JoinColumn, Column, CreateDateColumn, BeforeInsert, BeforeUpdate } from "typeorm";
import { validate, IsIn, IsNotEmpty } from "class-validator";
import { v1 as uuidv1 } from "uuid";

import { Visitor } from "./visitor";
import { Node } from "./node";

export enum MessageType {
    SYSTEM = 0,
    CHAT = 1,
    COMMAND = 2,
    ME = 3
}

@Entity()
export class Message {
    @PrimaryColumn("uuid")
    message_id: string;

    @Column({ nullable: true })
    author_id: string;

    @Column({ nullable: true })
    node_id: string;

    @ManyToOne(type => Visitor, visitor => visitor.messages)
    @JoinColumn({ name: "author_id" })
    author: Visitor;

    @ManyToOne(type => Node, node => node.messages)
    @JoinColumn({ name: "node_id" })
    node: Node;

    @IsIn(Object.values(MessageType).filter(t => typeof t === "number"))
    @Column("int")
    type: number;

    @IsNotEmpty()
    @Column("text")
    content: string;

    @CreateDateColumn()
    sent_at: Date;

    constructor(config: MessageConfig) {
        if(config) {
            this.message_id = uuidv1();
            this.author = config.author;
            this.node = config.node;
            this.type = config.type;
            this.content = config.content;
        }
    }

    @BeforeInsert()
    @BeforeUpdate()
    private async validate() {
        const errors = await validate(this);
        if(errors.length) throw errors[0];
    }
}

export interface MessageConfig {
    author: Visitor;
    node: Node;
    type: MessageType,
    content: string;
}