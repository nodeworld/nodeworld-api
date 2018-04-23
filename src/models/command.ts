import { IsNotEmpty, validate } from "class-validator";
import {
    BeforeInsert,
    BeforeUpdate,
    Column,
    Entity,
    JoinColumn,
    ManyToOne,
    OneToOne,
    PrimaryColumn,
} from "typeorm";
import { v1 as uuidv1 } from "uuid";

import { Node } from "./node";
import { Script } from "./script";

@Entity()
export class Command {
    @PrimaryColumn("uuid")
    public id: string;

    @Column({ nullable: false })
    // tslint:disable-next-line:variable-name
    public node_id: string;

    @Column({ nullable: false })
    // tslint:disable-next-line:variable-name
    public script_id: string | null;

    @ManyToOne(type => Node, node => node.commands, { onDelete: "CASCADE" })
    @JoinColumn({ name: "node_id" })
    public node: Node;

    @OneToOne(type => Script)
    @JoinColumn({ name: "script_id" })
    public script: Script | null;

    @IsNotEmpty()
    @Column("text")
    public name: string;

    constructor(config: CommandConfig) {
        if (config) {
            this.id = uuidv1();
            this.node = config.node;
            this.script = config.script || null;
            this.name = config.name;
        }
    }

    @BeforeInsert()
    @BeforeUpdate()
    private async validate() {
        const errors = await validate(this, { validationError: { target: false } });
        if (errors.length) throw errors[0];
    }
}

export interface CommandConfig {
    name: string;
    node: Node;
    script?: Script;
}
