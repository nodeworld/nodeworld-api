import { compare, compareSync, genSalt, hash as genHash } from "bcrypt";
import { IsAlphanumeric, IsEmail, IsNotEmpty, IsOptional, validate } from "class-validator";
import { BeforeInsert, BeforeUpdate, Column, Entity, OneToMany, PrimaryColumn } from "typeorm";
import { v1 as uuidv1 } from "uuid";

import { Message } from "./message";
import { Node } from "./node";
import { Script } from "./script";

@Entity()
export class Visitor {
    @PrimaryColumn("uuid")
    public id: string;

    @OneToMany(type => Node, node => node.owner)
    public nodes: Node[];

    @OneToMany(type => Script, script => script.owner)
    public scripts: Script[];

    @OneToMany(type => Message, message => message.author)
    public messages: Message[];

    @IsAlphanumeric()
    @IsNotEmpty()
    @Column("text", { unique: true })
    public name: string;

    @IsOptional()
    @IsEmail()
    @Column("text", { nullable: true, unique: true })
    public email: string | null;

    @Column("text", { select: false })
    // tslint:disable-next-line:variable-name
    public password_hash: string;

    @Column("text", { select: false })
    // tslint:disable-next-line:variable-name
    public password_salt: string;

    constructor(config: VisitorConfig) {
        if (config) {
            this.id = uuidv1();
            this.name = config.name;
            this.email = config.email || null;
        }
    }

    public safe() {
        return { id: this.id, name: this.name, email: this.email };
    }

    public async setPassword(password: string) {
        if (!password.trim()) throw new Error("Password required.");
        this.password_salt = await genSalt(10);
        this.password_hash = await genHash(password, this.password_salt);
    }

    public async authenticate(password: string) {
        return await compare(password, this.password_hash);
    }

    @BeforeInsert()
    @BeforeUpdate()
    private async validate() {
        if (!this.password_salt || !this.password_hash) throw new Error("Password required.");
        const errors = await validate(this, { validationError: { target: false } });
        if (errors.length) throw errors;
    }
}

export interface PublicVisitor {
    id: string;
    name: string;
    email: string | null;
}

export interface VisitorConfig {
    name: string;
    email?: string;
}
