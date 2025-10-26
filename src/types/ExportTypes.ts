export enum ExportType {
    PDF = "PDF",
    PNG = "PNG"
}

export type ExportState = {
    open: boolean;
    exportType?: ExportType
}