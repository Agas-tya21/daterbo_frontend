export interface User {
    iduser: string;
    namauser: string;
    email: string;
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