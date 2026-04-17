import WorkflowClient from '../../src/components/workflow/WorkflowClient';

export const metadata = {
  title: 'Workflow Studio — myPDF | Custom PDF Processing Pipelines',
  description: 'Design and run custom PDF processing workflows. Chain Split, Reorder, and Merge operations in one visual pipeline. 100% private and secure.',
};

export default function WorkflowPage() {
  return <WorkflowClient />;
}
