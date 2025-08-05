// agas-tya21/daterbo_frontend/daterbo_frontend-1d9a0105a6fa822db5e581083d639b017c6d96c8/src/app/types/index.ts
export interface Role {
    idrole: string;
    namarole: string;
}

export interface User {
    iduser: string;
    namauser: string;
    email: string;
    role?: Role;
}

export interface Status {
    idstatus: string;
    namastatus: string;
}

export interface Leasing {
    idleasing: string;
    namaleasing: string;
}

export interface DataPeminjam {
    iddatapeminjam: string;
    nik: string;
    user: User;
    status: Status;
    leasing: Leasing;
    tglinput: string;
    tglpenerimaan: string;
    tglpencairan: string;
    namapeminjam: string;
    nohp: string;
    aset: string;
    tahunaset: string;
    alamat: string;
    kota: string;
    kecamatan: string;
    keterangan: string;
    fotoktp: string;
    fotobpkb: string;
    fotostnk: string;
    fotokk: string;
    fotorekeningkoran: string;
    fotorekeninglistrik: string;
    fotobukunikah: string;
    fotosertifikat: string;
}