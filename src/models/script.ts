import { IsNotEmpty, validate } from "class-validator";
import {
    BeforeInsert,
    BeforeUpdate,
    Column,
    Entity,
    JoinColumn,
    ManyToOne,
    PrimaryColumn,
} from "typeorm";
import { v1 as uuidv1 } from "uuid";

import { Visitor } from "./visitor";

@Entity()
export class Script {
    @PrimaryColumn("uuid")
    public id: string;

    @Column({ nullable: false })
    // tslint:disable-next-line:variable-name
    public owner_id: string;

    @ManyToOne(type => Visitor, visitor => visitor.scripts, { onDelete: "CASCADE" })
    @JoinColumn({ name: "owner_id" })
    public owner: Visitor;

    @IsNotEmpty()
    @Column("text")
    public name: string;

    @Column("text", { nullable: true })
    public code: string | null;

    constructor(config: ScriptConfig) {
        if (config) {
            this.id = uuidv1();
            this.name = config.name;
            this.code = config.code || null;
        }
    }

    @BeforeInsert()
    @BeforeUpdate()
    private async validate() {
        const errors = await validate(this, { validationError: { target: false } });
        if (errors.length) throw errors[0];
    }
}

export interface ScriptConfig {
    name: string;
    code?: string;
}
