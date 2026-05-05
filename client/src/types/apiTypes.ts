import type { ApiReportT, ApiCaseDetailsT } from '../transform/transformTypes';

export type ReportResultSuccessT = {
    reportId: string;
    success: true;
    data: ApiReportT;
    cases: ApiCaseDetailsT[];
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
