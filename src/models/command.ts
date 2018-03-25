import { Entity, PrimaryColumn, ManyToOne, JoinColumn, Column, OneToOne, BeforeInsert, BeforeUpdate } from "typeorm";
import { validate, IsNotEmpty } from "class-validator";
import { v1 as uuidv1 } from "uuid";

import { Node } from "./node";
import { Script } from "./script";

@Entity()
export class Command {
    @PrimaryColumn("uuid")
    command_id: string;

    @Column({ nullable: true })
    node_id: string;

    @Column({ nullable: true })
    script_id: string | null;

    @ManyToOne(type => Node, node => node.commands, { onDelete: "CASCADE" })
    @JoinColumn({ name: "node_id" })
    node: Node;

    @OneToOne(type => Script, { nullable: true })
    @JoinColumn({ name: "script_id" })
    script: Script | null;

    @IsNotEmpty()
    @Column("text")
    name: string;

    constructor(config: CommandConfig) {
        if(config) {
            this.command_id = uuidv1();
            this.node = config.node;
            this.script = config.script || null;
            this.name = config.name;
        }
    }

    @BeforeInsert()
    @BeforeUpdate()
    private async validate() {
        const errors = await validate(this, { validationError: { target: false } });
        if(errors.length) throw errors[0];
    }
}

export interface CommandConfig {
    name: string;
    node: Node;
    script?: Script;
}