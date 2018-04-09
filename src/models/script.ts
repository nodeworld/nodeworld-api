import { Entity, PrimaryColumn, Column, BeforeInsert, BeforeUpdate, ManyToOne, JoinColumn } from "typeorm";
import { validate, IsNotEmpty } from "class-validator";
import { v1 as uuidv1 } from "uuid";

import { Visitor } from "./visitor";

@Entity()
export class Script {
    @PrimaryColumn("uuid")
    id: string;

    @Column({ nullable: true })
    owner_id: string;

    @ManyToOne(type => Visitor, visitor => visitor.scripts, { onDelete: "CASCADE" })
    @JoinColumn({ name: "owner_id" })
    owner: Visitor;

    @IsNotEmpty()
    @Column("text")
    name: string;

    @Column("text", { nullable: true })
    code: string | null;

    constructor(config: ScriptConfig) {
        if(config) {
            this.id = uuidv1();
            this.name = config.name;
            this.code = config.code || null;
        }
    }

    @BeforeInsert()
    @BeforeUpdate()
    private async validate() {
        const errors = await validate(this, { validationError: { target: false } });
        if(errors.length) throw errors[0];
    }
}

export interface ScriptConfig {
    name: string;
    code?: string;
}