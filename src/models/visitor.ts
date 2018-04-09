import { Entity, Column, PrimaryColumn, BeforeUpdate, BeforeInsert, OneToMany } from "typeorm";
import { genSalt, hash as genHash, compare } from "bcrypt";
import { validate, IsAlphanumeric, IsNotEmpty, IsOptional, IsEmail } from "class-validator";
import { v1 as uuidv1 } from "uuid";

import { Node } from "./node";
import { Script } from "./script";
import { Message } from "./message";

@Entity()
export class Visitor {
    @PrimaryColumn("uuid")
    id: string;

    @OneToMany(type => Node, node => node.owner)
    nodes: Node[];

    @OneToMany(type => Script, script => script.owner)
    scripts: Script[];

    @OneToMany(type => Message, message => message.author)
    messages: Message[];
    
    @IsAlphanumeric()
    @IsNotEmpty()
    @Column("text", { unique: true })
    name: string;

    @IsOptional()
    @IsEmail()
    @Column("text", { nullable: true, unique: true })
    email: string | null;

    @Column("text", { select: false })
    password_hash: string;

    @Column("text", { select: false })
    password_salt: string;

    constructor(config: VisitorConfig) {
        if(config) {
            this.id = uuidv1();
            this.name = config.name;
            this.email = config.email || null;
        }
    }

    @BeforeInsert()
    @BeforeUpdate()
    private async validate() {
        if(!this.password_salt || !this.password_hash) throw new Error("Password required.");
        const errors = await validate(this, { validationError: { target: false } });
        if(errors.length) throw errors;
    }

    public async setPassword(password: string) {
        this.password_salt = await genSalt(10);
        this.password_hash = await genHash(password, this.password_salt);
    }

    public async authenticate(password: string) {
        return compare(password, this.password_hash);
    }

    public safe() {
        return { id: this.id, name: this.name, email: this.email };
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