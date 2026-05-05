import type { ApiReportT } from '../transform/transformTypes';

export type ReportResultSuccessT = {
    reportId: string;
    success: true;
    data: ApiReportT;
};

export type ReportResultErrorT = {
    reportId: string;
    success: false;
    status: number;
    message: string;
};

export type ReportResultT = ReportResultSuccessT | ReportResultErrorT;

export type ExtractionResponseT = {
    success: boolean;
    results: ReportResultT[];
};
