export interface PlateAnalysis {
    meal: string;
    ingredients: {
        name: string;
        type: string;
    }[];
    nutrition_info: {
        type: string;
        percentage: number
        recommended_percentage: number
    }[]
    recommendation: string;
    meets_recommendation: boolean;
}

export interface AnalysisResult {
    docId: string;
    imagePath: string;
    status?: {
        completeTime: string;
        startTime: string;
        state: string;
        error?: string;
        updateTime: string;
    }
    output: string;
}