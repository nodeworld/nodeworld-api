import { Entity, PrimaryColumn, ManyToOne, JoinColumn, Column, BeforeInsert, BeforeUpdate, OneToMany } from "typeorm";
import { validate, IsAlphanumeric, IsNotEmpty, IsOptional } from "class-validator";
import { v1 as uuidv1 } from "uuid";

import { Visitor } from "./visitor";
import { Command } from "./command";
import { Message } from "./message";

@Entity()
export class Node {
    @PrimaryColumn("uuid")
    id: string;

    @Column({ nullable: true })
    owner_id: string;

    @ManyToOne(type => Visitor, visitor => visitor.nodes, { onDelete: "CASCADE" })
    @JoinColumn({ name: "owner_id" })
    owner: Visitor;

    @OneToMany(type => Message, message => message.node)
    messages: Message[];

    @OneToMany(type => Command, command => command.node)
    commands: Command[];

    @IsAlphanumeric()
    @IsNotEmpty()
    @Column("text", { unique: true })
    name: string;

    @IsOptional()
    @Column("text", { nullable: true })
    greeting: string | null;

    constructor(config: NodeConfig) {
        if(config) {
            this.id = uuidv1();
            this.owner = config.owner;
            this.name = config.name;
            this.greeting = config.greeting || null;
        }
    }

    @BeforeInsert()
    @BeforeUpdate()
    private async validate() {
        const errors = await validate(this, { validationError: { target: false } });
        if(errors.length) throw errors[0];
    }

    public safe() {
        if(this.owner)
            return { node_id: this.id, name: this.name, greeting: this.greeting, owner_id: this.owner.id }
        else
            return { node_id: this.id, name: this.name, greeting: this.greeting, owner_id: this.owner_id }
    }
}

export interface NodeConfig {
    name: string;
    greeting?: string;
    owner: Visitor;
}