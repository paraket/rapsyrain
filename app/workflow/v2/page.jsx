import WorkflowV2Client from '../../../src/components/workflow/v2/WorkflowV2Client';

export const metadata = {
  title: 'Workflow Studio V2 — Designer Mode | myPDF',
  description: 'Visual drag-and-drop PDF pipeline designer.',
};

export default function WorkflowV2Page() {
  return <WorkflowV2Client />;
}
