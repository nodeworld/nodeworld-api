import { Entity, PrimaryColumn, ManyToOne, JoinColumn, Column, CreateDateColumn, BeforeInsert, BeforeUpdate } from "typeorm";
import { validate, IsIn, IsNotEmpty } from "class-validator";
import { v1 as uuidv1 } from "uuid";

import { Visitor } from "./visitor";
import { Node } from "./node";

export enum MessageType {
    SYSTEM = 0,
    CHAT = 1,
    ACTION = 2
}

@Entity()
export class Message {
    @PrimaryColumn("uuid")
    id: string;

    @Column({ nullable: false })
    author_id: string;

    @Column({ nullable: false })
    node_id: string;

    @ManyToOne(type => Visitor, visitor => visitor.messages, { nullable: false })
    @JoinColumn({ name: "author_id" })
    author: Visitor;

    @ManyToOne(type => Node, node => node.messages, { nullable: false })
    @JoinColumn({ name: "node_id" })
    node: Node;

    @IsIn(Object.values(MessageType).filter(t => typeof t === "number"))
    @Column("int")
    type: number;

    @IsNotEmpty()
    @Column("text", { nullable: true })
    name: string;

    @IsNotEmpty()
    @Column("text")
    content: string;

    @CreateDateColumn()
    sent_at: Date;

    constructor(config: MessageConfig) {
        if(config) {
            this.id = uuidv1();
            this.author = config.author;
            this.node = config.node;
            this.type = config.type;
            this.name = config.name;
            this.content = config.content;
        }
    }

    @BeforeInsert()
    @BeforeUpdate()
    private async validate() {
        const errors = await validate(this, { validationError: { target: false } });
        if(errors.length) throw errors[0];
    }

    public safe() {
        return {
            id: this.id,
            author_id: this.author ? this.author.id : this.author_id,
            node_id: this.node ? this.node.id : this.node_id,
            type: this.type,
            name: this.name,
            content: this.content
        };
    }
}

export interface MessageConfig {
    author: Visitor;
    node: Node;
    type: MessageType,
    name: string;
    content: string;
}